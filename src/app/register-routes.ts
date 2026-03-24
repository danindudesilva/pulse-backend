import type { Express } from 'express';
import { healthRouter } from '../routes/health.route.js';
import { createBootstrapRouter } from '../modules/identity/api/bootstrap.route.js';
import type { BootstrapUserExecutor } from '../modules/identity/domain/bootstrap-user.types.js';
import {
  createOpportunityRouter,
  type CreateOpportunityExecutor,
  type GetOpportunityExecutor,
  type ListOpportunitiesExecutor,
  type UpdateOpportunityStatusExecutor
} from '../modules/opportunities/api/opportunity.route.js';
import { createRequireAuthContextMiddleware } from '../modules/auth/api/require-auth-context.middleware.js';
import { requireClerkAuth } from '../modules/auth/api/require-clerk-auth.middleware.js';
import type { AuthContext } from '../modules/auth/domain/auth-context.types.js';

type ResolveAuthContextExecutor = {
  execute(input: { clerkUserId: string }): Promise<AuthContext>;
};

export type AppDependencies = {
  bootstrapUserService: BootstrapUserExecutor;
  createOpportunityService: CreateOpportunityExecutor;
  listOpportunitiesService: ListOpportunitiesExecutor;
  getOpportunityService: GetOpportunityExecutor;
  updateOpportunityStatusService: UpdateOpportunityStatusExecutor;
  resolveAuthContextService: ResolveAuthContextExecutor;
};

export function registerRoutes(app: Express, deps: AppDependencies) {
  const requireAuthContext = createRequireAuthContextMiddleware(
    deps.resolveAuthContextService
  );

  app.use('/health', healthRouter);

  app.use(
    '/api/auth/bootstrap',
    requireClerkAuth,
    createBootstrapRouter(deps.bootstrapUserService)
  );

  app.use(
    '/api/opportunities',
    requireAuthContext,
    createOpportunityRouter({
      createOpportunityService: deps.createOpportunityService,
      listOpportunitiesService: deps.listOpportunitiesService,
      getOpportunityService: deps.getOpportunityService,
      updateOpportunityStatusService: deps.updateOpportunityStatusService
    })
  );
}
