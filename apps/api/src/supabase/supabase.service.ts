import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Backend-side Supabase client, authenticated with the service role key.
 *
 * This client bypasses Row Level Security by design — the NestJS layer is
 * responsible for enforcing tenant isolation explicitly (see
 * WorkspaceGuard / WorkspaceContext). RLS policies in
 * supabase/migrations/*.sql remain in place as defense-in-depth for any
 * access path that goes directly through Supabase (Storage, Realtime,
 * client-side reads using the user's own JWT).
 */
@Injectable()
export class SupabaseService {
  public readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>("SUPABASE_URL");
    const serviceKey = this.config.getOrThrow<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    this.client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  /** Client scoped to a specific user's JWT — respects RLS as that user. */
  forUser(accessToken: string): SupabaseClient {
    const url = this.config.getOrThrow<string>("SUPABASE_URL");
    const anonKey = this.config.getOrThrow<string>("SUPABASE_ANON_KEY");
    return createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
