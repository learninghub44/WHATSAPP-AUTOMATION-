import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { workspacesTable } from "./workspaces";
import { contactsTable, conversationsTable } from "./whatsapp";

export const aiProviderNameEnum = pgEnum("ai_provider_name", [
  "groq",
  "openrouter",
  "openai",
  "anthropic",
  "gemini",
]);

/**
 * Per-workspace AI assistant configuration. `providerPriority` drives the
 * AI Gateway's fallback chain — see apps/api/src/modules/ai-gateway.
 */
export const aiSettingsTable = pgTable("ai_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .unique()
    .references(() => workspacesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Assistant"),
  personality: text("personality"),
  instructions: text("instructions"),
  industry: text("industry"),
  language: text("language").notNull().default("en"),
  tone: text("tone"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  providerPriority: jsonb("provider_priority")
    .$type<Array<"groq" | "openrouter" | "openai" | "anthropic" | "gemini">>()
    .notNull()
    .default(["groq", "openrouter", "openai", "gemini", "anthropic"]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Encrypted API keys per workspace per provider (BYO-key support). */
export const aiProvidersTable = pgTable(
  "ai_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    provider: aiProviderNameEnum("provider").notNull(),
    apiKeyCiphertext: text("api_key_ciphertext"), // null = use platform key
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ai_providers_workspace_idx").on(t.workspaceId)],
);

/** One row per AI turn — powers the analytics (provider usage/cost/latency). */
export const aiConversationsTable = pgTable(
  "ai_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
    providerUsed: aiProviderNameEnum("provider_used").notNull(),
    model: text("model").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    failedProviders: jsonb("failed_providers").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ai_conversations_workspace_idx").on(t.workspaceId)],
);

/** Long-term AI memory per contact (preferences, history, key facts). */
export const aiMemoryTable = pgTable(
  "ai_memory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contactsTable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ai_memory_contact_idx").on(t.contactId)],
);

export type AiSettings = typeof aiSettingsTable.$inferSelect;
export type AiProviderConfig = typeof aiProvidersTable.$inferSelect;
