import { z } from 'zod';

export const createOpportunityBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    companyName: z.string().trim().min(1).max(200).optional(),
    contactName: z.string().trim().min(1).max(120).optional(),
    contactEmail: z.email().optional(),
    valueAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Value must be a valid decimal amount')
      .optional(),
    currency: z.string().trim().length(3).optional(),
    notes: z.string().trim().min(1).max(5000).optional(),
    status: z.enum(['draft', 'sent']),
    quoteSentAt: z.iso.datetime().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status !== 'sent' && value.quoteSentAt !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['quoteSentAt'],
        message: 'Quote sent date is only allowed when status is sent'
      });
    }

    if (value.status === 'sent' && !value.quoteSentAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['quoteSentAt'],
        message: 'Quote sent date is required when status is sent'
      });
    }

    if (value.status === 'sent' && value.quoteSentAt) {
      const quoteSentAt = new Date(value.quoteSentAt);

      if (quoteSentAt.getTime() > Date.now()) {
        ctx.addIssue({
          code: 'custom',
          path: ['quoteSentAt'],
          message: 'Quote sent date cannot be in the future'
        });
      }
    }
  });

export const listOpportunitiesQuerySchema = z
  .object({
    view: z.enum(['all', 'due', 'upcoming']).optional(),
    status: z
      .enum(['draft', 'sent', 'replied', 'won', 'lost', 'paused'])
      .optional()
  })
  .strict();

export const opportunityParamsSchema = z.object({
  opportunityId: z.string().trim().min(1)
});

export const updateOpportunityStatusBodySchema = z
  .object({
    status: z.enum(['draft', 'sent', 'replied', 'won', 'lost', 'paused']),
    quoteSentAt: z.iso.datetime().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === 'sent' && !value.quoteSentAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['quoteSentAt'],
        message: 'Quote sent date is required when status is sent'
      });
    }

    if (value.status === 'sent' && value.quoteSentAt) {
      const quoteSentAt = new Date(value.quoteSentAt);

      if (quoteSentAt.getTime() > Date.now()) {
        ctx.addIssue({
          code: 'custom',
          path: ['quoteSentAt'],
          message: 'Quote sent date cannot be in the future'
        });
      }
    }
  });

export const updateOpportunityBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    companyName: z
      .union([z.string().trim().min(1).max(200), z.null()])
      .optional(),
    contactName: z
      .union([z.string().trim().min(1).max(120), z.null()])
      .optional(),
    contactEmail: z.union([z.email(), z.null()]).optional(),
    valueAmount: z
      .union([
        z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/, 'Value must be a valid decimal amount'),
        z.null()
      ])
      .optional(),
    currency: z.union([z.string().trim().length(3), z.null()]).optional(),
    notes: z.union([z.string().trim().min(1).max(5000), z.null()]).optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one editable field must be provided'
  });
