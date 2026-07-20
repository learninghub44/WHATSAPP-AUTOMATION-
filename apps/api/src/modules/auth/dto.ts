import { z } from "zod/v4";
import { createZodDto } from "../../common/zod-dto";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});
export class RegisterDto extends createZodDto(registerSchema) {}

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export class LoginDto extends createZodDto(loginSchema) {}

export const resetPasswordSchema = z.object({
  email: z.email(),
});
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
