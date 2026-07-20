import { Injectable } from "@nestjs/common";
import {
  AiProviderAdapter,
  CompletionRequest,
  CompletionResult,
} from "./ai-provider.interface";

@Injectable()
export class AnthropicAdapter implements AiProviderAdapter {
  readonly name = "anthropic" as const;
  private readonly model = "claude-sonnet-4-6";

  async complete(
    req: CompletionRequest,
    apiKey: string,
  ): Promise<CompletionResult> {
    const system = req.messages.find((m) => m.role === "system")?.content;
    const conversation = req.messages.filter((m) => m.role !== "system");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0.7,
        ...(system ? { system } : {}),
        messages: conversation,
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    return {
      content: json.content?.[0]?.text ?? "",
      model: this.model,
      promptTokens: json.usage?.input_tokens ?? 0,
      completionTokens: json.usage?.output_tokens ?? 0,
    };
  }
}
