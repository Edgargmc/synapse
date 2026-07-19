import { z } from 'zod';

export const evolutionGraphPathParamsSchema = z.object({
  futureIdentityId: z.string().uuid(),
});

export type EvolutionGraphPathParams = z.infer<
  typeof evolutionGraphPathParamsSchema
>;
