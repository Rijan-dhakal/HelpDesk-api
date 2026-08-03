import { z } from "zod";

export const env = z
  .object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.url(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    NODE_ENV: z.enum(["development", "production", "test"]),
    RESEND_API_KEY: z.string(),
    EMAIL_FROM: z.string(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string(),
    FRONTEND_URL: z.url(),
  })
  .parse(process.env);
