import { z } from 'zod';

export const bootstrapUserBodySchema = z.object({
  clerkUserId: z.string().trim().min(1),
  email: z.email(),
  name: z.string().trim().min(1).max(120).optional()
});
