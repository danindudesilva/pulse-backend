import { describe, expect, it } from 'vitest';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import { InMemoryIdentityRepository } from './helpers/mock-identity-repository.js';

describe('BootstrapUserService', () => {
  it('bootstraps a new user and workspace', async () => {
    const repository = new InMemoryIdentityRepository();
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
    const repository = new InMemoryIdentityRepository();
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
