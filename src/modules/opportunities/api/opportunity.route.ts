import { Router } from 'express';
import { MethodNotAllowedError } from '../../../lib/errors/app-error.js';
import { asyncHandler } from '../../../lib/http/async-handler.js';
import { validateBody } from '../../../lib/validation/validate.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';
import { createOpportunityBodySchema } from './opportunity.schemas.js';

export type CreateOpportunityExecutor = {
  execute(input: CreateOpportunityInput): Promise<OpportunitySummary>;
};

export function createOpportunityRouter(service: CreateOpportunityExecutor) {
  const router = Router();

  router
    .route('/')
    .post(
      asyncHandler(async (req, res) => {
        const parsed = validateBody(createOpportunityBodySchema, req);

        const body: CreateOpportunityInput = {
          workspaceId: parsed.workspaceId,
          createdByUserId: parsed.createdByUserId,
          title: parsed.title,
          ...(parsed.companyName !== undefined
            ? { companyName: parsed.companyName }
            : {}),
          ...(parsed.contactName !== undefined
            ? { contactName: parsed.contactName }
            : {}),
          ...(parsed.contactEmail !== undefined
            ? { contactEmail: parsed.contactEmail }
            : {}),
          ...(parsed.valueAmount !== undefined
            ? { valueAmount: parsed.valueAmount }
            : {}),
          ...(parsed.currency !== undefined
            ? { currency: parsed.currency.toUpperCase() }
            : {}),
          ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
          status: parsed.status,
          ...(parsed.quoteSentAt !== undefined
            ? { quoteSentAt: new Date(parsed.quoteSentAt) }
            : {})
        };

        const result = await service.execute(body);

        res.status(201).json(result);
      })
    )
    .all((req, _res, next) => {
      next(
        new MethodNotAllowedError(
          `Method ${req.method} not allowed for ${req.baseUrl || '/api/opportunities'}`
        )
      );
    });

  return router;
}
