import { describe, expect, it } from 'vitest';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../modules/identity/domain/bootstrap-user.types.js';
import type { IdentityRepository } from '../modules/identity/infrastructure/identity.repository.js';

class MockIdentityRepository implements IdentityRepository {
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

describe('BootstrapUserService', () => {
  it('bootstraps a new user and workspace', async () => {
    const repository = new MockIdentityRepository();
    const service = new BootstrapUserService(repository);

    const result = await service.execute({
      clerkUserId: 'clerk_123',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    expect(result.user.clerkUserId).toBe('clerk_123');
    expect(result.user.email).toBe('jack@example.com');
    expect(result.workspace.name).toBe("Jack's Workspace");
    expect(result.membership.role).toBe('owner');
  });

  it('returns the existing workspace for an already bootstrapped user', async () => {
    const repository = new MockIdentityRepository();
    const service = new BootstrapUserService(repository);

    await service.execute({
      clerkUserId: 'clerk_123',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    const result = await service.execute({
      clerkUserId: 'clerk_123',
      email: 'jack+updated@example.com',
      name: 'Jack Sparrow'
    });

    expect(result.user.email).toBe('jack+updated@example.com');
    expect(result.workspace.id).toBe('workspace_1');
    expect(result.membership.role).toBe('owner');
  });
});
