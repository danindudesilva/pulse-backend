import type {
  BootstrapUserExecutor,
  BootstrapUserInput,
  BootstrapUserResult
} from '../../../modules/identity/domain/bootstrap-user.types.js';
import { WORKSPACE_OWNER_ROLE } from '../../../modules/identity/domain/identity.constants.js';

export class StubBootstrapUserService implements BootstrapUserExecutor {
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
        role: WORKSPACE_OWNER_ROLE
      }
    };
  }
}
