import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "agent",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "starter",
  "professional",
  "business",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
]);

/** One row per Supabase auth.users entry — public profile data. */
export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey(), // == auth.users.id
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** A tenant. Every business-owned row hangs off a workspaceId. */
export const workspacesTable = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Membership + role — the join table every tenant-isolation check hinges on. */
export const workspaceMembersTable = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspacesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  role: workspaceRoleEnum("role").notNull().default("agent"),
  invitedBy: uuid("invited_by").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .unique()
    .references(() => workspacesTable.id, { onDelete: "cascade" }),
  plan: subscriptionPlanEnum("plan").notNull().default("starter"),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  paystackCustomerCode: text("paystack_customer_code"),
  paystackSubscriptionCode: text("paystack_subscription_code"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  limits: jsonb("limits").$type<{
    whatsappNumbers: number;
    agents: number;
    automations: number;
    aiMessagesPerMonth: number;
    campaignsPerMonth: number;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertWorkspaceSchema = createInsertSchema(workspacesTable).omit(
  { id: true, createdAt: true, updatedAt: true },
);
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspacesTable.$inferSelect;
export type WorkspaceMember = typeof workspaceMembersTable.$inferSelect;
export type Profile = typeof profilesTable.$inferSelect;
export type Subscription = typeof subscriptionsTable.$inferSelect;
