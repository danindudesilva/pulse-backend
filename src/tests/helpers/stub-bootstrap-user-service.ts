import type { BootstrapUserService } from '../../modules/identity/application/bootstrap-user.service.js';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../../modules/identity/domain/bootstrap-user.types.js';

export class StubBootstrapUserService implements Pick<
  BootstrapUserService,
  'execute'
> {
  async execute(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    return {
      user: {
        id: 'user_1',
        clerkUserId: input.clerkUserId,
        email: input.email,
        name: input.name ?? null
      },
      workspace: {
        id: 'workspace_1',
        name: "Jack's Workspace"
      },
      membership: {
        role: 'owner'
      }
    };
  }
}
