import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../../modules/identity/domain/bootstrap-user.types.js';
import type { IdentityRepository } from '../../modules/identity/infrastructure/identity.repository.js';

export class MockIdentityRepository implements IdentityRepository {
  private readonly users = new Map<
    string,
    {
      user: BootstrapUserResult['user'];
      workspace: BootstrapUserResult['workspace'];
      membership: BootstrapUserResult['membership'];
    }
  >();

  async bootstrapUser(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    const existing = this.users.get(input.clerkUserId);

    if (existing) {
      const updated = {
        ...existing,
        user: {
          ...existing.user,
          email: input.email,
          name: input.name ?? null
        }
      };

      this.users.set(input.clerkUserId, updated);
      return updated;
    }

    const created: BootstrapUserResult = {
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

    this.users.set(input.clerkUserId, created);

    return created;
  }
}
