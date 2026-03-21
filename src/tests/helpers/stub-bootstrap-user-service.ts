import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../../modules/identity/domain/bootstrap-user.types.js';

export class StubBootstrapUserService {
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
