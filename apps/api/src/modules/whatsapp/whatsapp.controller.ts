import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { Public } from "../../common/decorators/public.decorator";
import { WebhookSignatureGuard } from "./webhook-signature.guard";
import { WhatsappWebhookService } from "./whatsapp-webhook.service";

@Controller("webhooks/whatsapp")
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly webhookService: WhatsappWebhookService,
  ) {}

  /** Meta's one-time webhook verification handshake. */
  @Public()
  @Get()
  verify(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response,
  ) {
    const expected = this.config.getOrThrow<string>("META_WEBHOOK_VERIFY_TOKEN");
    if (mode === "subscribe" && token === expected) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).send("Verification failed");
  }

  /** Real-time inbound messages, statuses, delivery/read receipts. */
  @Public()
  @UseGuards(WebhookSignatureGuard)
  @Post()
  async receive(@Body() body: unknown, @Res() res: Response) {
    // Acknowledge immediately — Meta retries aggressively on non-2xx/slow
    // responses. Processing happens before the ack here for phase 1
    // (synchronous); phase 2 moves this to a BullMQ queue for throughput.
    if (!body || typeof body !== "object") {
      throw new BadRequestException("Invalid webhook payload");
    }
    try {
      await this.webhookService.process(body as { entry?: unknown[] } as any);
    } catch (err) {
      this.logger.error("Failed to process WhatsApp webhook", err as Error);
      // Still 200 — Meta will retry on failure and we don't want a poison
      // payload to block the subscription. Errors are logged for the
      // dead-letter/reconciliation job (phase 2).
    }
    res.status(200).send("EVENT_RECEIVED");
  }
}
