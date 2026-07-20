import { z } from "zod/v4";
import { createZodDto } from "../../common/zod-dto";

export const assignConversationSchema = z.object({
  status: z.enum(["open", "pending", "resolved", "closed"]).optional(),
  assignedAgentId: z.uuid().optional(),
});
export class AssignConversationDto extends createZodDto(
  assignConversationSchema,
) {}
