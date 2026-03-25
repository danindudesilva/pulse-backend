import type { Express } from 'express';
import { healthRouter } from '../routes/health.route.js';
import { createBootstrapRouter } from '../modules/identity/api/bootstrap.route.js';
import type { BootstrapUserExecutor } from '../modules/identity/domain/bootstrap-user.types.js';
import {
  createOpportunityRouter,
  type CreateOpportunityExecutor,
  type GetOpportunityExecutor,
  type ListOpportunitiesExecutor,
  type UpdateOpportunityExecutor,
  type UpdateOpportunityStatusExecutor
} from '../modules/opportunities/api/opportunity.route.js';
import { createRequireAuthContextMiddleware } from '../modules/auth/api/require-auth-context.middleware.js';
import { requireClerkAuth } from '../modules/auth/api/require-clerk-auth.middleware.js';
import type { AuthContext } from '../modules/auth/domain/auth-context.types.js';
import {
  createDashboardRouter,
  type GetDashboardSummaryExecutor
} from '../modules/dashboard/api/dashboard.route.js';

type ResolveAuthContextExecutor = {
  execute(input: { clerkUserId: string }): Promise<AuthContext>;
};

export type AppDependencies = {
  bootstrapUserService: BootstrapUserExecutor;
  createOpportunityService: CreateOpportunityExecutor;
  listOpportunitiesService: ListOpportunitiesExecutor;
  getOpportunityService: GetOpportunityExecutor;
  updateOpportunityService: UpdateOpportunityExecutor;
  updateOpportunityStatusService: UpdateOpportunityStatusExecutor;
  getDashboardSummaryService: GetDashboardSummaryExecutor;
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
    '/api/dashboard',
    requireAuthContext,
    createDashboardRouter(deps.getDashboardSummaryService)
  );

  app.use(
    '/api/opportunities',
    requireAuthContext,
    createOpportunityRouter({
      createOpportunityService: deps.createOpportunityService,
      listOpportunitiesService: deps.listOpportunitiesService,
      getOpportunityService: deps.getOpportunityService,
      updateOpportunityService: deps.updateOpportunityService,
      updateOpportunityStatusService: deps.updateOpportunityStatusService
    })
  );
}
