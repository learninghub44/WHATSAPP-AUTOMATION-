import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import { Request } from "express";

/**
 * Verifies Meta's X-Hub-Signature-256 header against the raw request body,
 * HMAC-SHA256 signed with the Meta App Secret. This is what makes the
 * webhook endpoint trustworthy without requiring Supabase auth on it —
 * only Meta (who knows the app secret) can produce a valid signature.
 *
 * Requires the raw body buffer — see main.ts bodyParser verify hook.
 */
@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { rawBody?: Buffer }>();

    const signatureHeader = req.headers["x-hub-signature-256"] as
      | string
      | undefined;
    if (!signatureHeader || !req.rawBody) {
      throw new ForbiddenException("Missing webhook signature");
    }

    const appSecret = this.config.getOrThrow<string>("META_APP_SECRET");
    const expected =
      "sha256=" +
      createHmac("sha256", appSecret).update(req.rawBody).digest("hex");

    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException("Invalid webhook signature");
    }

    return true;
  }
}
