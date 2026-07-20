import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { db, profilesTable } from "@workspace/db";
import { Public } from "../../common/decorators/public.decorator";
import { SupabaseService } from "../../supabase/supabase.service";
import { LoginDto, RegisterDto, ResetPasswordDto } from "./dto";

/**
 * Thin wrapper over Supabase Auth (GoTrue) — Supabase owns password
 * hashing, session issuance, and email verification/reset delivery.
 * Configure Supabase's SMTP provider to Resend in the Supabase dashboard
 * (Project Settings -> Auth -> SMTP) so verification/reset emails send
 * through Resend, per spec — that's dashboard config, not application code.
 */
@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: { data: { full_name: dto.fullName } },
    });
    if (error) throw new UnauthorizedException(error.message);

    if (data.user) {
      await db
        .insert(profilesTable)
        .values({ id: data.user.id, fullName: dto.fullName })
        .onConflictDoNothing();
    }

    return {
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      session: data.session,
      // If email confirmations are enabled in Supabase, session is null
      // here until the user clicks the verification link.
    };
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error) throw new UnauthorizedException(error.message);
    return { user: data.user, session: data.session };
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(
      dto.email,
    );
    if (error) throw new UnauthorizedException(error.message);
    return { message: "Password reset email sent" };
  }
}
