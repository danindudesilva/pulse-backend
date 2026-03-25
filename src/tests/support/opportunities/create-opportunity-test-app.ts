import express from 'express';
import { errorMiddleware } from '../../../lib/http/error-middleware.js';
import { createOpportunityRouter } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  CreateOpportunityExecutor,
  GetOpportunityExecutor,
  ListOpportunitiesExecutor,
  UpdateOpportunityExecutor,
  UpdateOpportunityStatusExecutor
} from '../../../modules/opportunities/api/opportunity.route.js';
import type { AuthContext } from '../../../modules/auth/domain/auth-context.types.js';
import { StubCreateOpportunityService } from './stub-create-opportunity-service.js';
import { StubListOpportunitiesService } from './stub-list-opportunities.service.js';
import { StubGetOpportunityService } from './stub-get-opportunity.service.js';
import { StubUpdateOpportunityStatusService } from './stub-update-opportunity-status.service.js';
import { StubUpdateOpportunityService } from './stub-update-opportunity.service.js';

export function createOpportunityTestApp(
  services?: {
    createOpportunityService?: CreateOpportunityExecutor;
    listOpportunitiesService?: ListOpportunitiesExecutor;
    getOpportunityService?: GetOpportunityExecutor;
    updateOpportunityService?: UpdateOpportunityExecutor;
    updateOpportunityStatusService?: UpdateOpportunityStatusExecutor;
  },
  authContext?: AuthContext
) {
  const app = express();

  app.use(express.json());

  if (authContext) {
    app.use((req, _res, next) => {
      req.authContext = authContext;
      next();
    });
  }

  app.use(
    '/api/opportunities',
    createOpportunityRouter({
      createOpportunityService:
        services?.createOpportunityService ??
        new StubCreateOpportunityService(),
      listOpportunitiesService:
        services?.listOpportunitiesService ??
        new StubListOpportunitiesService(),
      getOpportunityService:
        services?.getOpportunityService ?? new StubGetOpportunityService(),
      updateOpportunityService:
        services?.updateOpportunityService ??
        new StubUpdateOpportunityService(),
      updateOpportunityStatusService:
        services?.updateOpportunityStatusService ??
        new StubUpdateOpportunityStatusService()
    })
  );

  app.use(errorMiddleware);

  return app;
}
