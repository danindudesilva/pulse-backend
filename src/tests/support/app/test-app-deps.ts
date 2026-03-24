import type { AppDependencies } from '../../../app/register-routes.js';
import type { BootstrapUserExecutor } from '../../../modules/identity/domain/bootstrap-user.types.js';
import type { CreateOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type { AuthContext } from '../../../modules/auth/domain/auth-context.types.js';
import { StubCreateOpportunityService } from '../opportunities/stub-create-opportunity-service.js';
import { StubResolveAuthContextService } from '../auth/stub-resolve-auth-context.service.js';
import { StubBootstrapUserService } from '../identity.ts/stub-bootstrap-user-service.js';

type TestAppDependencyOverrides = {
  bootstrapUserService?: BootstrapUserExecutor;
  createOpportunityService?: CreateOpportunityExecutor;
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
    resolveAuthContextService:
      overrides.resolveAuthContextService ??
      new StubResolveAuthContextService({
        clerkUserId: 'clerk_123',
        userId: 'user_1',
        workspaceId: 'workspace_1'
      })
  };
}
