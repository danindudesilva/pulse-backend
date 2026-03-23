import type { Express } from 'express';
import { healthRouter } from '../routes/health.route.js';
import { createBootstrapRouter } from '../modules/identity/api/bootstrap.route.js';
import type { BootstrapUserExecutor } from '../modules/identity/domain/bootstrap-user.types.js';
import { createOpportunityRouter } from '../modules/opportunities/api/opportunity.route.js';
import type { CreateOpportunityExecutor } from '../modules/opportunities/api/opportunity.route.js';

export type AppDependencies = {
  bootstrapUserService: BootstrapUserExecutor;
  createOpportunityService: CreateOpportunityExecutor;
  resolveAuthContextService: ResolveAuthContextExecutor;
};

export function registerRoutes(app: Express, deps: AppDependencies) {
  app.use('/health', healthRouter);
  app.use(
    '/api/auth/bootstrap',
    createBootstrapRouter(deps.bootstrapUserService)
  );
  app.use(
    '/api/opportunities',
    createOpportunityRouter(deps.createOpportunityService)
  );
}
