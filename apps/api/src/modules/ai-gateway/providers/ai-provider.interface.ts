export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResult {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Every AI provider (Groq, OpenRouter, OpenAI, Anthropic, Gemini) implements
 * this. Adding a new provider means writing one adapter — nothing else in
 * the gateway or automation engine changes. Each adapter makes a real HTTP
 * call to its provider; no mocked responses.
 */
export interface AiProviderAdapter {
  readonly name: "groq" | "openrouter" | "openai" | "anthropic" | "gemini";
  complete(req: CompletionRequest, apiKey: string): Promise<CompletionResult>;
}
