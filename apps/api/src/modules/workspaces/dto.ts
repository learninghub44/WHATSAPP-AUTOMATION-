import { z } from "zod/v4";
import { createZodDto } from "../../common/zod-dto";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only"),
});
export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}

export const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["admin", "agent"]),
});
export class InviteMemberDto extends createZodDto(inviteMemberSchema) {}

const PLAN_LIMITS = {
  starter: {
    whatsappNumbers: 1,
    agents: 3,
    automations: 5,
    aiMessagesPerMonth: 1000,
    campaignsPerMonth: 2,
  },
  professional: {
    whatsappNumbers: 3,
    agents: 10,
    automations: 25,
    aiMessagesPerMonth: 10000,
    campaignsPerMonth: 10,
  },
  business: {
    whatsappNumbers: 10,
    agents: 50,
    automations: 200,
    aiMessagesPerMonth: 100000,
    campaignsPerMonth: 50,
  },
} as const;

export function defaultLimitsFor(plan: keyof typeof PLAN_LIMITS) {
  return PLAN_LIMITS[plan];
}
