import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV !== 'test') {
  if (!env.CLERK_PUBLISHABLE_KEY) {
    throw new Error('CLERK_PUBLISHABLE_KEY is required outside test');
  }

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is required outside test');
  }
}
