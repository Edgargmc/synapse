import { z } from 'zod';

export const futureIdentityPathParamsSchema = z.object({
  futureIdentityId: z.string().uuid(),
});

export const createGoalRequestSchema = z
  .object({
    desiredOutcome: z.string(),
    purpose: z.string(),
  })
  .strict();

export type FutureIdentityPathParams = z.infer<
  typeof futureIdentityPathParamsSchema
>;
export type CreateGoalRequest = z.infer<typeof createGoalRequestSchema>;
