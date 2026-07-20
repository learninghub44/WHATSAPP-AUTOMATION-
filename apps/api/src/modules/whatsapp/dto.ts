import { z } from "zod/v4";
import { createZodDto } from "../../common/zod-dto";

export const connectWhatsappAccountSchema = z.object({
  displayName: z.string().min(1),
  businessAccountId: z.string().min(1),
  phoneNumberId: z.string().min(1),
  phoneNumber: z.string().min(1),
  accessToken: z.string().min(20),
});
export class ConnectWhatsappAccountDto extends createZodDto(
  connectWhatsappAccountSchema,
) {}

export const sendMessageSchema = z.object({
  to: z.string().min(6),
  type: z.enum(["text", "template"]),
  text: z.string().optional(),
  templateName: z.string().optional(),
  languageCode: z.string().optional(),
  templateComponents: z.array(z.record(z.string(), z.unknown())).optional(),
});
export class SendMessageDto extends createZodDto(sendMessageSchema) {}
