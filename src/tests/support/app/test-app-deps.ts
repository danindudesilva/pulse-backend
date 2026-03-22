import type { AppDependencies } from '../../../app/register-routes.js';
import type { BootstrapUserExecutor } from '../../../modules/identity/domain/bootstrap-user.types.js';
import type { CreateOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import { StubBootstrapUserService } from '../identity.ts/stub-bootstrap-user-service.js';
import { StubCreateOpportunityService } from '../opportunities/stub-create-opportunity-service.js';

type TestAppDependencyOverrides = {
  bootstrapUserService?: BootstrapUserExecutor;
  createOpportunityService?: CreateOpportunityExecutor;
};

export function createTestAppDependencies(
  overrides: TestAppDependencyOverrides = {}
): AppDependencies {
  return {
    bootstrapUserService:
      overrides.bootstrapUserService ?? new StubBootstrapUserService(),
    createOpportunityService:
      overrides.createOpportunityService ?? new StubCreateOpportunityService()
  };
}
