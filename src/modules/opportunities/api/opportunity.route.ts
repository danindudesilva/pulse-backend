import { Router } from 'express';
import {
  MethodNotAllowedError,
  UnauthorizedError
} from '../../../lib/errors/app-error.js';
import { asyncHandler } from '../../../lib/http/async-handler.js';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../../../lib/validation/validate.js';
import type {
  CreateOpportunityInput,
  GetOpportunityInput,
  ListOpportunitiesInput,
  OpportunitySummary,
  UpdateOpportunityInput,
  UpdateOpportunityStatusInput
} from '../domain/opportunity.types.js';
import {
  createOpportunityBodySchema,
  listOpportunitiesQuerySchema,
  opportunityParamsSchema,
  updateOpportunityBodySchema,
  updateOpportunityStatusBodySchema
} from './opportunity.schemas.js';

export type CreateOpportunityExecutor = {
  execute(input: CreateOpportunityInput): Promise<OpportunitySummary>;
};

export type ListOpportunitiesExecutor = {
  execute(input: ListOpportunitiesInput): Promise<OpportunitySummary[]>;
};

export type GetOpportunityExecutor = {
  execute(input: GetOpportunityInput): Promise<OpportunitySummary>;
};

export type UpdateOpportunityStatusExecutor = {
  execute(input: UpdateOpportunityStatusInput): Promise<OpportunitySummary>;
};

export type UpdateOpportunityExecutor = {
  execute(input: UpdateOpportunityInput): Promise<OpportunitySummary>;
};

export function createOpportunityRouter(deps: {
  createOpportunityService: CreateOpportunityExecutor;
  listOpportunitiesService: ListOpportunitiesExecutor;
  getOpportunityService: GetOpportunityExecutor;
  updateOpportunityService: UpdateOpportunityExecutor;
  updateOpportunityStatusService: UpdateOpportunityStatusExecutor;
}) {
  const router = Router();

  router
    .route('/')
    .get(
      asyncHandler(async (req, res) => {
        if (!req.authContext) {
          throw new UnauthorizedError('Authentication required');
        }

        const query = validateQuery(listOpportunitiesQuerySchema, req);

        const result = await deps.listOpportunitiesService.execute({
          workspaceId: req.authContext.workspaceId,
          ...(query.view !== undefined ? { view: query.view } : {}),
          ...(query.status !== undefined ? { status: query.status } : {})
        });

        res.status(200).json(result);
      })
    )
    .post(
      asyncHandler(async (req, res) => {
        if (!req.authContext) {
          throw new UnauthorizedError('Authentication required');
        }

        const parsed = validateBody(createOpportunityBodySchema, req);

        const body: CreateOpportunityInput = {
          workspaceId: req.authContext.workspaceId,
          createdByUserId: req.authContext.userId,
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

        const result = await deps.createOpportunityService.execute(body);

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

  router
    .route('/:opportunityId')
    .get(
      asyncHandler(async (req, res) => {
        if (!req.authContext) {
          throw new UnauthorizedError('Authentication required');
        }

        const params = validateParams(opportunityParamsSchema, req);

        const result = await deps.getOpportunityService.execute({
          workspaceId: req.authContext.workspaceId,
          opportunityId: params.opportunityId
        });

        res.status(200).json(result);
      })
    )
    .patch(
      asyncHandler(async (req, res) => {
        if (!req.authContext) {
          throw new UnauthorizedError('Authentication required');
        }

        const params = validateParams(opportunityParamsSchema, req);
        const body = validateBody(updateOpportunityBodySchema, req);

        const result = await deps.updateOpportunityService.execute({
          workspaceId: req.authContext.workspaceId,
          opportunityId: params.opportunityId,
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.companyName !== undefined
            ? { companyName: body.companyName }
            : {}),
          ...(body.contactName !== undefined
            ? { contactName: body.contactName }
            : {}),
          ...(body.contactEmail !== undefined
            ? { contactEmail: body.contactEmail }
            : {}),
          ...(body.valueAmount !== undefined
            ? { valueAmount: body.valueAmount }
            : {}),
          ...(body.currency !== undefined
            ? {
                currency:
                  body.currency === null ? null : body.currency.toUpperCase()
              }
            : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {})
        });

        res.status(200).json(result);
      })
    )
    .all((req, _res, next) => {
      next(
        new MethodNotAllowedError(
          `Method ${req.method} not allowed for ${
            req.baseUrl || '/api/opportunities/:opportunityId'
          }`
        )
      );
    });

  router
    .route('/:opportunityId/status')
    .patch(
      asyncHandler(async (req, res) => {
        if (!req.authContext) {
          throw new UnauthorizedError('Authentication required');
        }

        const params = validateParams(opportunityParamsSchema, req);
        const body = validateBody(updateOpportunityStatusBodySchema, req);

        const result = await deps.updateOpportunityStatusService.execute({
          workspaceId: req.authContext.workspaceId,
          opportunityId: params.opportunityId,
          status: body.status,
          ...(body.quoteSentAt !== undefined
            ? { quoteSentAt: new Date(body.quoteSentAt) }
            : {})
        });

        res.status(200).json(result);
      })
    )
    .all((req, _res, next) => {
      next(
        new MethodNotAllowedError(
          `Method ${req.method} not allowed for ${
            req.baseUrl || '/api/opportunities/:opportunityId/status'
          }`
        )
      );
    });

  return router;
}
