import { Router } from 'express';
import {
  MethodNotAllowedError,
  UnauthorizedError
} from '../../../lib/errors/app-error.js';
import { asyncHandler } from '../../../lib/http/async-handler.js';
import type { DashboardSummary } from '../domain/dashboard-summary.types.js';

export type GetDashboardSummaryExecutor = {
  execute(workspaceId: string): Promise<DashboardSummary>;
};

export function createDashboardRouter(service: GetDashboardSummaryExecutor) {
  const router = Router();

  router
    .route('/summary')
    .get(
      asyncHandler(async (req, res) => {
        if (!req.authContext) {
          throw new UnauthorizedError('Authentication required');
        }

        const result = await service.execute(req.authContext.workspaceId);

        res.status(200).json(result);
      })
    )
    .all((req, _res, next) => {
      next(
        new MethodNotAllowedError(
          `Method ${req.method} not allowed for ${
            req.baseUrl || '/api/dashboard/summary'
          }`
        )
      );
    });

  return router;
}
