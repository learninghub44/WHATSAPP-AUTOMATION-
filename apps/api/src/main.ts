import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Required so WebhookSignatureGuard can HMAC-verify the exact bytes
    // Meta signed — req.rawBody is populated by Nest's body parser when
    // this flag is set.
    rawBody: true,
  });

  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" });
  app.setGlobalPrefix("api/v1", { exclude: ["health", "webhooks/whatsapp"] });

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  Logger.log(`API listening on :${port}`, "Bootstrap");
}

bootstrap();
