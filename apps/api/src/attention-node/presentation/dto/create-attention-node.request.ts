import { z } from 'zod';

export const goalPathParamsSchema = z.object({
  goalId: z.string().uuid(),
});

export const createAttentionNodeRequestSchema = z
  .object({
    name: z.string(),
    description: z.string().nullable().optional(),
  })
  .strict();

export type GoalPathParams = z.infer<typeof goalPathParamsSchema>;
export type CreateAttentionNodeRequest = z.infer<
  typeof createAttentionNodeRequestSchema
>;
