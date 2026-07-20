import { z } from "zod/v4";
import { createZodDto } from "../../common/zod-dto";

export const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  leadStatus: z.enum(["cold", "warm", "hot", "customer"]).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});
export class UpdateContactDto extends createZodDto(updateContactSchema) {}
