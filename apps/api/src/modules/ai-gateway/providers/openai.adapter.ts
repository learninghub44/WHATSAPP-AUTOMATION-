import { Injectable } from "@nestjs/common";
import {
  AiProviderAdapter,
  CompletionRequest,
  CompletionResult,
} from "./ai-provider.interface";

@Injectable()
export class OpenAiAdapter implements AiProviderAdapter {
  readonly name = "openai" as const;
  private readonly model = "gpt-4o-mini";

  async complete(
    req: CompletionRequest,
    apiKey: string,
  ): Promise<CompletionResult> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: req.messages,
        max_tokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    return {
      content: json.choices[0].message.content,
      model: this.model,
      promptTokens: json.usage?.prompt_tokens ?? 0,
      completionTokens: json.usage?.completion_tokens ?? 0,
    };
  }
}
