import { z } from 'zod';

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive(),
  API_CORS_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
