import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { eq, and } from "drizzle-orm";
import { db, aiProvidersTable, aiConversationsTable } from "@workspace/db";
import { SecretBoxService } from "../../common/crypto/secret-box.service";
import { GroqAdapter } from "./providers/groq.adapter";
import { OpenRouterAdapter } from "./providers/openrouter.adapter";
import { OpenAiAdapter } from "./providers/openai.adapter";
import { AnthropicAdapter } from "./providers/anthropic.adapter";
import { GeminiAdapter } from "./providers/gemini.adapter";
import {
  AiProviderAdapter,
  CompletionRequest,
  CompletionResult,
} from "./providers/ai-provider.interface";

export type ProviderName = AiProviderAdapter["name"];

export interface GatewayResult extends CompletionResult {
  providerUsed: ProviderName;
  failedProviders: string[];
  latencyMs: number;
}

/**
 * Tries providers in priority order and returns the first success. Every
 * adapter call is a real network request — failures (rate limit, outage,
 * invalid key) fall through to the next provider so the customer never
 * sees AI downtime, per spec.
 */
@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly adapters: Record<ProviderName, AiProviderAdapter>;

  constructor(
    private readonly config: ConfigService,
    private readonly secretBox: SecretBoxService,
    groq: GroqAdapter,
    openrouter: OpenRouterAdapter,
    openai: OpenAiAdapter,
    anthropic: AnthropicAdapter,
    gemini: GeminiAdapter,
  ) {
    this.adapters = { groq, openrouter, openai, anthropic, gemini };
  }

  async complete(
    workspaceId: string,
    conversationId: string,
    priority: ProviderName[],
    request: CompletionRequest,
  ): Promise<GatewayResult> {
    const failed: string[] = [];
    const start = Date.now();

    for (const providerName of priority) {
      const adapter = this.adapters[providerName];
      const apiKey = await this.resolveApiKey(workspaceId, providerName);
      if (!apiKey) {
        failed.push(`${providerName}: no API key configured`);
        continue;
      }

      try {
        const result = await adapter.complete(request, apiKey);
        const latencyMs = Date.now() - start;

        await db.insert(aiConversationsTable).values({
          workspaceId,
          conversationId,
          providerUsed: providerName,
          model: result.model,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          latencyMs,
          failedProviders: failed.length ? failed : null,
        });

        return { ...result, providerUsed: providerName, failedProviders: failed, latencyMs };
      } catch (err) {
        this.logger.warn(
          `AI provider ${providerName} failed, falling back: ${(err as Error).message}`,
        );
        failed.push(`${providerName}: ${(err as Error).message}`);
      }
    }

    throw new Error(
      `All AI providers failed or unconfigured: ${failed.join("; ")}`,
    );
  }

  /**
   * BYO-key (workspace-specific) takes priority over the platform-wide key
   * from env, so agencies can bill usage to their own provider accounts.
   */
  private async resolveApiKey(
    workspaceId: string,
    provider: ProviderName,
  ): Promise<string | null> {
    const [byoKey] = await db
      .select()
      .from(aiProvidersTable)
      .where(
        and(
          eq(aiProvidersTable.workspaceId, workspaceId),
          eq(aiProvidersTable.provider, provider),
          eq(aiProvidersTable.isActive, true),
        ),
      )
      .limit(1);

    if (byoKey?.apiKeyCiphertext) {
      return this.secretBox.decrypt(byoKey.apiKeyCiphertext);
    }

    const envKey = this.config.get<string>(
      `${provider.toUpperCase()}_API_KEY`,
    );
    return envKey ?? null;
  }
}
