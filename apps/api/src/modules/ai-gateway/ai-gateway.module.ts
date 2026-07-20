import { Module } from "@nestjs/common";
import { AiGatewayService } from "./ai-gateway.service";
import { GroqAdapter } from "./providers/groq.adapter";
import { OpenRouterAdapter } from "./providers/openrouter.adapter";
import { OpenAiAdapter } from "./providers/openai.adapter";
import { AnthropicAdapter } from "./providers/anthropic.adapter";
import { GeminiAdapter } from "./providers/gemini.adapter";

@Module({
  providers: [
    AiGatewayService,
    GroqAdapter,
    OpenRouterAdapter,
    OpenAiAdapter,
    AnthropicAdapter,
    GeminiAdapter,
  ],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
