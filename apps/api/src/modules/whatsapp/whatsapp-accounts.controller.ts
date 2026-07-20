import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { eq, and } from "drizzle-orm";
import { db, whatsappAccountsTable } from "@workspace/db";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { CurrentWorkspace } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { WorkspaceContext } from "../../common/types";
import { SecretBoxService } from "../../common/crypto/secret-box.service";
import { WhatsappCloudApiClient } from "./whatsapp-cloud-api.client";
import { ConnectWhatsappAccountDto, SendMessageDto } from "./dto";

@UseGuards(SupabaseAuthGuard, WorkspaceGuard)
@Controller("workspaces/:workspaceId/whatsapp-accounts")
export class WhatsappAccountsController {
  constructor(
    private readonly secretBox: SecretBoxService,
    private readonly cloudApi: WhatsappCloudApiClient,
  ) {}

  @Get()
  list(@CurrentWorkspace() workspace: WorkspaceContext) {
    return db
      .select({
        id: whatsappAccountsTable.id,
        displayName: whatsappAccountsTable.displayName,
        phoneNumber: whatsappAccountsTable.phoneNumber,
        phoneNumberId: whatsappAccountsTable.phoneNumberId,
        isActive: whatsappAccountsTable.isActive,
        createdAt: whatsappAccountsTable.createdAt,
      })
      .from(whatsappAccountsTable)
      .where(eq(whatsappAccountsTable.workspaceId, workspace.workspaceId));
    // Access tokens are never selected back out — write-only at rest.
  }

  @Roles("owner", "admin")
  @Post()
  async connect(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Body() dto: ConnectWhatsappAccountDto,
  ) {
    const [created] = await db
      .insert(whatsappAccountsTable)
      .values({
        workspaceId: workspace.workspaceId,
        displayName: dto.displayName,
        businessAccountId: dto.businessAccountId,
        phoneNumberId: dto.phoneNumberId,
        phoneNumber: dto.phoneNumber,
        accessTokenCiphertext: this.secretBox.encrypt(dto.accessToken),
        webhookVerifyToken: randomBytes(24).toString("hex"),
      })
      .returning({
        id: whatsappAccountsTable.id,
        displayName: whatsappAccountsTable.displayName,
        phoneNumberId: whatsappAccountsTable.phoneNumberId,
      });
    return created;
  }

  @Post(":accountId/messages")
  async sendMessage(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("accountId") accountId: string,
    @Body() dto: SendMessageDto,
  ) {
    const [account] = await db
      .select()
      .from(whatsappAccountsTable)
      .where(
        and(
          eq(whatsappAccountsTable.id, accountId),
          eq(whatsappAccountsTable.workspaceId, workspace.workspaceId),
        ),
      )
      .limit(1);

    if (!account) {
      throw new Error("WhatsApp account not found in this workspace");
    }

    const accessToken = this.secretBox.decrypt(account.accessTokenCiphertext);

    const result = await (() => {
      switch (dto.type) {
        case "text":
          return this.cloudApi.sendText(
            account.phoneNumberId,
            accessToken,
            dto.to,
            dto.text!,
          );
        case "template":
          return this.cloudApi.sendTemplate(
            account.phoneNumberId,
            accessToken,
            dto.to,
            dto.templateName!,
            dto.languageCode ?? "en_US",
            dto.templateComponents,
          );
        default:
          throw new Error(`Unsupported send type in phase 1: ${dto.type}`);
      }
    })();

    return result;
  }
}
