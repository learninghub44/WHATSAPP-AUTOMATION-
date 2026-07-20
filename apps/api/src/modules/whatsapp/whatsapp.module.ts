import { Module } from "@nestjs/common";
import { WhatsappWebhookController } from "./whatsapp.controller";
import { WhatsappAccountsController } from "./whatsapp-accounts.controller";
import { WhatsappWebhookService } from "./whatsapp-webhook.service";
import { WhatsappCloudApiClient } from "./whatsapp-cloud-api.client";
import { SecretBoxService } from "../../common/crypto/secret-box.service";

@Module({
  controllers: [WhatsappWebhookController, WhatsappAccountsController],
  providers: [WhatsappWebhookService, WhatsappCloudApiClient, SecretBoxService],
  exports: [WhatsappCloudApiClient],
})
export class WhatsappModule {}
