import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workspacesTable, profilesTable } from "./workspaces";

export const messageDirectionEnum = pgEnum("message_direction", [
  "inbound",
  "outbound",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "video",
  "audio",
  "document",
  "buttons",
  "list",
  "template",
  "sticker",
  "location",
  "contacts",
]);

export const messageStatusEnum = pgEnum("message_status", [
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "open",
  "pending",
  "resolved",
  "closed",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "cold",
  "warm",
  "hot",
  "customer",
]);

/** A connected Meta WhatsApp Business phone number, scoped to one workspace. */
export const whatsappAccountsTable = pgTable(
  "whatsapp_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    businessAccountId: text("business_account_id").notNull(),
    phoneNumberId: text("phone_number_id").notNull(),
    phoneNumber: text("phone_number").notNull(),
    // Encrypted at rest — see WhatsappCredentialsService. Never store plaintext.
    accessTokenCiphertext: text("access_token_ciphertext").notNull(),
    webhookVerifyToken: text("webhook_verify_token").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("whatsapp_accounts_phone_number_id_idx").on(t.phoneNumberId),
    index("whatsapp_accounts_workspace_idx").on(t.workspaceId),
  ],
);

export const contactsTable = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    waId: text("wa_id").notNull(), // WhatsApp's phone-number-as-id, E.164 no '+'
    name: text("name"),
    email: text("email"),
    leadStatus: leadStatusEnum("lead_status").notNull().default("cold"),
    leadScore: text("lead_score").default("0"),
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
    lastInteractionAt: timestamp("last_interaction_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("contacts_workspace_wa_id_idx").on(t.workspaceId, t.waId),
    index("contacts_workspace_idx").on(t.workspaceId),
  ],
);

export const contactTagsTable = pgTable(
  "contact_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contactsTable.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("contact_tags_unique_idx").on(t.contactId, t.tag)],
);

export const conversationsTable = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    whatsappAccountId: uuid("whatsapp_account_id")
      .notNull()
      .references(() => whatsappAccountsTable.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contactsTable.id, { onDelete: "cascade" }),
    assignedAgentId: uuid("assigned_agent_id").references(
      () => profilesTable.id,
    ),
    status: conversationStatusEnum("status").notNull().default("open"),
    isAiHandled: boolean("is_ai_handled").notNull().default(true),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("conversations_workspace_idx").on(t.workspaceId),
    index("conversations_contact_idx").on(t.contactId),
  ],
);

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
    direction: messageDirectionEnum("direction").notNull(),
    type: messageTypeEnum("type").notNull(),
    status: messageStatusEnum("status").notNull().default("queued"),
    // Meta's wamid — used to correlate status webhooks back to this row.
    whatsappMessageId: text("whatsapp_message_id"),
    body: jsonb("body").$type<Record<string, unknown>>().notNull(),
    sentByAgentId: uuid("sent_by_agent_id").references(() => profilesTable.id),
    sentByAi: boolean("sent_by_ai").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("messages_conversation_idx").on(t.conversationId, t.createdAt),
    uniqueIndex("messages_whatsapp_message_id_idx").on(t.whatsappMessageId),
  ],
);

export const insertContactSchema = createInsertSchema(contactsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;
export type WhatsappAccount = typeof whatsappAccountsTable.$inferSelect;
export type Conversation = typeof conversationsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
