import { Injectable, Logger } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  db,
  whatsappAccountsTable,
  contactsTable,
  conversationsTable,
  messagesTable,
  type WhatsappAccount,
} from "@workspace/db";

interface MetaWebhookEntry {
  id: string;
  changes: {
    field: string;
    value: {
      metadata: { phone_number_id: string; display_phone_number: string };
      contacts?: { wa_id: string; profile: { name: string } }[];
      messages?: MetaInboundMessage[];
      statuses?: MetaStatus[];
    };
  }[];
}

interface MetaInboundMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  [key: string]: unknown;
}

interface MetaStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
}

const STATUS_MAP: Record<MetaStatus["status"], "sent" | "delivered" | "read" | "failed"> = {
  sent: "sent",
  delivered: "delivered",
  read: "read",
  failed: "failed",
};

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name);

  async process(payload: { entry?: MetaWebhookEntry[] }): Promise<void> {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;
        const { value } = change;

        const account = await this.findAccount(value.metadata.phone_number_id);
        if (!account) {
          this.logger.warn(
            `Webhook for unknown phone_number_id ${value.metadata.phone_number_id} — ignoring`,
          );
          continue;
        }

        for (const msg of value.messages ?? []) {
          await this.handleInboundMessage(account, msg, value.contacts);
        }
        for (const status of value.statuses ?? []) {
          await this.handleStatus(account, status);
        }
      }
    }
  }

  private findAccount(phoneNumberId: string): Promise<WhatsappAccount | undefined> {
    return db
      .select()
      .from(whatsappAccountsTable)
      .where(eq(whatsappAccountsTable.phoneNumberId, phoneNumberId))
      .limit(1)
      .then((rows) => rows[0]);
  }

  private async handleInboundMessage(
    account: WhatsappAccount,
    msg: MetaInboundMessage,
    metaContacts?: { wa_id: string; profile: { name: string } }[],
  ): Promise<void> {
    const profileName = metaContacts?.find((c) => c.wa_id === msg.from)?.profile
      .name;

    const contact = await this.upsertContact(
      account.workspaceId,
      msg.from,
      profileName,
    );

    const conversation = await this.findOrCreateOpenConversation(
      account.workspaceId,
      account.id,
      contact.id,
    );

    await db.insert(messagesTable).values({
      workspaceId: account.workspaceId,
      conversationId: conversation.id,
      direction: "inbound",
      type: this.mapInboundType(msg.type),
      status: "delivered",
      whatsappMessageId: msg.id,
      body: msg,
    });

    // TODO(phase 2): publish `message.received` event here for the
    // Automation Engine / AI Gateway to pick up (BullMQ queue).
  }

  private async handleStatus(
    account: WhatsappAccount,
    status: MetaStatus,
  ): Promise<void> {
    await db
      .update(messagesTable)
      .set({ status: STATUS_MAP[status.status] })
      .where(
        and(
          eq(messagesTable.whatsappMessageId, status.id),
          eq(messagesTable.workspaceId, account.workspaceId),
        ),
      );
  }

  private async upsertContact(
    workspaceId: string,
    waId: string,
    name: string | undefined,
  ) {
    const [existing] = await db
      .select()
      .from(contactsTable)
      .where(
        and(
          eq(contactsTable.workspaceId, workspaceId),
          eq(contactsTable.waId, waId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(contactsTable)
        .set({ lastInteractionAt: new Date(), name: name ?? existing.name })
        .where(eq(contactsTable.id, existing.id));
      return existing;
    }

    const [created] = await db
      .insert(contactsTable)
      .values({
        workspaceId,
        waId,
        name: name ?? null,
        lastInteractionAt: new Date(),
      })
      .returning();
    return created;
  }

  private async findOrCreateOpenConversation(
    workspaceId: string,
    whatsappAccountId: string,
    contactId: string,
  ) {
    const [existing] = await db
      .select()
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.workspaceId, workspaceId),
          eq(conversationsTable.contactId, contactId),
          eq(conversationsTable.status, "open"),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(conversationsTable)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversationsTable.id, existing.id));
      return existing;
    }

    const [created] = await db
      .insert(conversationsTable)
      .values({
        workspaceId,
        whatsappAccountId,
        contactId,
        status: "open",
        lastMessageAt: new Date(),
      })
      .returning();
    return created;
  }

  private mapInboundType(
    metaType: string,
  ):
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "buttons"
    | "list"
    | "template"
    | "sticker"
    | "location"
    | "contacts" {
    switch (metaType) {
      case "text":
      case "image":
      case "video":
      case "audio":
      case "document":
      case "sticker":
      case "location":
      case "contacts":
        return metaType;
      case "interactive":
      case "button":
        return "buttons";
      default:
        return "text";
    }
  }
}
