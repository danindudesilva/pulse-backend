import type { AppDependencies } from '../../../app/register-routes.js';
import type { BootstrapUserExecutor } from '../../../modules/identity/domain/bootstrap-user.types.js';
import { StubBootstrapUserService } from '../identity.ts/stub-bootstrap-user-service.js';

type TestAppDependencyOverrides = {
  bootstrapUserService?: BootstrapUserExecutor;
};

export function createTestAppDependencies(
  overrides: TestAppDependencyOverrides = {}
): AppDependencies {
  return {
    bootstrapUserService:
      overrides.bootstrapUserService ?? new StubBootstrapUserService()
  };
}
