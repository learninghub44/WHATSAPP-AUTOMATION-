import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { SupabaseService } from "../../supabase/supabase.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Reflector } from "@nestjs/core";

/**
 * Verifies the bearer token against Supabase Auth (real network call to
 * Supabase's GoTrue service — this is not a local JWT decode, so it also
 * catches revoked/expired sessions). Attaches req.user on success.
 *
 * Every route is protected by default. Use @Public() to opt out
 * (e.g. the WhatsApp webhook, which is authenticated by Meta's own
 * verify-token / signature scheme instead).
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = authHeader.slice("Bearer ".length);

    const { data, error } = await this.supabase.client.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    req.user = { id: data.user.id, email: data.user.email ?? null };
    // stash the raw token so downstream code can build a user-scoped client
    (req as Request & { accessToken?: string }).accessToken = token;
    return true;
  }
}
