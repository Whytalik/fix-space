import { z } from 'zod';

export const envSchema = z.object({
  // NODE_ENV is set by the runtime, not loaded from .env files.
  // It is validated here but never belongs in an env file.
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().startsWith('postgresql://'),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('60m'),

  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  SPACE_NAME_TEMPLATE: z.string().default("{{username}}'s Space"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}
