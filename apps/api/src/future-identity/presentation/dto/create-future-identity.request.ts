import { z } from 'zod';

export const createFutureIdentityRequestSchema = z
  .object({
    statement: z.string(),
    purpose: z.string(),
  })
  .strict();

export type CreateFutureIdentityRequest = z.infer<
  typeof createFutureIdentityRequestSchema
>;
