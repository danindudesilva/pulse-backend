import express from 'express';
import { errorMiddleware } from '../../../lib/http/error-middleware.js';
import { createOpportunityRouter } from '../../../modules/opportunities/api/opportunity.route.js';
import type { CreateOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type { AuthContext } from '../../../modules/auth/domain/auth-context.types.js';
import { StubCreateOpportunityService } from './stub-create-opportunity-service.js';

export function createOpportunityTestApp(
  service: CreateOpportunityExecutor = new StubCreateOpportunityService(),
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

  app.use('/api/opportunities', createOpportunityRouter(service));
  app.use(errorMiddleware);

  return app;
}
