import { z } from 'zod';

export const createOpportunityBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    companyName: z.string().trim().min(1).max(200).optional(),
    contactName: z.string().trim().min(1).max(120).optional(),
    contactEmail: z.email().optional(),
    valueAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'valueAmount must be a valid decimal string')
      .optional(),
    currency: z.string().trim().length(3).optional(),
    notes: z.string().trim().min(1).max(5000).optional(),
    status: z.enum(['draft', 'sent']),
    quoteSentAt: z.iso.datetime().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === 'sent' && !value.quoteSentAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['quoteSentAt'],
        message: 'quoteSentAt is required when status is sent'
      });
    }
  });
