import type { AppDependencies } from '../../../app/register-routes.js';
import type { BootstrapUserExecutor } from '../../../modules/identity/domain/bootstrap-user.types.js';
import type {
  CreateOpportunityExecutor,
  GetOpportunityExecutor,
  ListOpportunitiesExecutor,
  UpdateOpportunityExecutor,
  UpdateOpportunityStatusExecutor
} from '../../../modules/opportunities/api/opportunity.route.js';
import type { AuthContext } from '../../../modules/auth/domain/auth-context.types.js';
import { StubCreateOpportunityService } from '../opportunities/stub-create-opportunity-service.js';
import { StubListOpportunitiesService } from '../opportunities/stub-list-opportunities.service.js';
import { StubGetOpportunityService } from '../opportunities/stub-get-opportunity.service.js';
import { StubUpdateOpportunityService } from '../opportunities/stub-update-opportunity.service.js';
import { StubUpdateOpportunityStatusService } from '../opportunities/stub-update-opportunity-status.service.js';
import { StubResolveAuthContextService } from '../auth/stub-resolve-auth-context.service.js';
import { StubBootstrapUserService } from '../identity.ts/stub-bootstrap-user-service.js';
import type { GetDashboardSummaryExecutor } from '../../../modules/dashboard/api/dashboard.route.js';
import { StubGetDashboardSummaryService } from '../dashboard/stub-get-dashboard-summary.service.js';

type TestAppDependencyOverrides = {
  bootstrapUserService?: BootstrapUserExecutor;
  createOpportunityService?: CreateOpportunityExecutor;
  listOpportunitiesService?: ListOpportunitiesExecutor;
  getOpportunityService?: GetOpportunityExecutor;
  updateOpportunityService?: UpdateOpportunityExecutor;
  updateOpportunityStatusService?: UpdateOpportunityStatusExecutor;
  getDashboardSummaryService?: GetDashboardSummaryExecutor;
  resolveAuthContextService?: {
    execute(input: { clerkUserId: string }): Promise<AuthContext>;
  };
};

export function createTestAppDependencies(
  overrides: TestAppDependencyOverrides = {}
): AppDependencies {
  return {
    bootstrapUserService:
      overrides.bootstrapUserService ?? new StubBootstrapUserService(),
    createOpportunityService:
      overrides.createOpportunityService ?? new StubCreateOpportunityService(),
    listOpportunitiesService:
      overrides.listOpportunitiesService ?? new StubListOpportunitiesService(),
    getOpportunityService:
      overrides.getOpportunityService ?? new StubGetOpportunityService(),
    updateOpportunityService:
      overrides.updateOpportunityService ?? new StubUpdateOpportunityService(),
    updateOpportunityStatusService:
      overrides.updateOpportunityStatusService ??
      new StubUpdateOpportunityStatusService(),
    getDashboardSummaryService:
      overrides.getDashboardSummaryService ??
      new StubGetDashboardSummaryService(),
    resolveAuthContextService:
      overrides.resolveAuthContextService ??
      new StubResolveAuthContextService({
        clerkUserId: 'clerk_123',
        userId: 'user_1',
        workspaceId: 'workspace_1'
      })
  };
}
