import { Injectable } from "@nestjs/common";
import {
  AiProviderAdapter,
  CompletionRequest,
  CompletionResult,
} from "./ai-provider.interface";

@Injectable()
export class GeminiAdapter implements AiProviderAdapter {
  readonly name = "gemini" as const;
  private readonly model = "gemini-2.0-flash";

  async complete(
    req: CompletionRequest,
    apiKey: string,
  ): Promise<CompletionResult> {
    const system = req.messages.find((m) => m.role === "system")?.content;
    const contents = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          ...(system
            ? { systemInstruction: { parts: [{ text: system }] } }
            : {}),
          generationConfig: {
            maxOutputTokens: req.maxTokens ?? 1024,
            temperature: req.temperature ?? 0.7,
          },
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    return {
      content: json.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
      model: this.model,
      promptTokens: json.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: json.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }
}
