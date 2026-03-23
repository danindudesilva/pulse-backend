import { z } from 'zod';

export const bootstrapUserBodySchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(120).optional()
});
