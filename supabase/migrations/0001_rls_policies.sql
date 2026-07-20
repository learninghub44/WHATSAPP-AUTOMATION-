-- Row Level Security for phase-1 tables.
--
-- Run this AFTER `pnpm --filter @workspace/db run push` has created the
-- tables (Drizzle owns table/column DDL; this file owns RLS only).
--
-- The NestJS API connects with the Postgres service-role connection
-- (DATABASE_URL) and enforces tenant isolation in application code via
-- WorkspaceGuard, so these policies are defense-in-depth for any access
-- path that goes directly through the Supabase client with a user JWT
-- (Storage, Realtime subscriptions, future client-side reads).

alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table subscriptions enable row level security;
alter table whatsapp_accounts enable row level security;
alter table contacts enable row level security;
alter table contact_tags enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table ai_settings enable row level security;
alter table ai_providers enable row level security;
alter table ai_conversations enable row level security;
alter table ai_memory enable row level security;

-- Helper: is the current auth.uid() a member of this workspace?
create or replace function is_workspace_member(check_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = check_workspace_id
      and user_id = auth.uid()
  );
$$;

-- profiles: a user can read/update only their own profile row.
create policy "profiles_self" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- workspaces: members can read; only the owner can update/delete.
create policy "workspaces_member_select" on workspaces
  for select using (is_workspace_member(id));
create policy "workspaces_owner_write" on workspaces
  for update using (owner_id = auth.uid());
create policy "workspaces_owner_delete" on workspaces
  for delete using (owner_id = auth.uid());

-- workspace_members: visible to members of the same workspace.
create policy "workspace_members_select" on workspace_members
  for select using (is_workspace_member(workspace_id));

-- Generic per-tenant tables: full access gated on workspace membership.
-- (Write-side role checks, e.g. "only owner/admin can delete a WhatsApp
-- account", are enforced in the NestJS service layer, not here.)
create policy "subscriptions_member" on subscriptions
  for select using (is_workspace_member(workspace_id));

create policy "whatsapp_accounts_member" on whatsapp_accounts
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "contacts_member" on contacts
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "contact_tags_member" on contact_tags
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "conversations_member" on conversations
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "messages_member" on messages
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "ai_settings_member" on ai_settings
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "ai_providers_member" on ai_providers
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "ai_conversations_member" on ai_conversations
  for select using (is_workspace_member(workspace_id));

create policy "ai_memory_member" on ai_memory
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
