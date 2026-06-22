import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().startsWith("postgresql://"),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),

  VERIFICATION_TOKEN_EXPIRATION_HOURS: z.coerce.number().default(24),

  COOKIE_DOMAIN: z.string().default("localhost"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default("noreply@fixspace.app"),
  APP_URL: z.string().default("http://localhost:3001"),

  CORS_ORIGIN: z.string().default("http://localhost:3001"),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().default("http://localhost:3000/auth/google/callback"),

  CREDENTIALS_ENCRYPTION_KEY: z
    .string()
    .length(64, "CREDENTIALS_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate with: openssl rand -hex 32")
    .default("0".repeat(64)),

  MT5_SIDECAR_URL: z.string().url().optional(),
  MT5_SIDECAR_TOKEN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}
