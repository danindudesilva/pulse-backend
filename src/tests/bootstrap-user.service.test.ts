import { describe, expect, it } from 'vitest';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import { InMemoryIdentityRepository } from './helpers/in-memory-identity-repository.js';

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

  it('creates a workspace name from the email prefix when name is omitted', async () => {
    const repository = new InMemoryIdentityRepository();
    const service = new BootstrapUserService(repository);

    const result = await service.execute({
      clerkUserId: 'clerk_456',
      email: 'captain@blackpearl.com'
    });

    expect(result.workspace.name).toBe("captain's Workspace");
    expect(result.user.name).toBeNull();
  });

  it('updates the existing user name when bootstrap input changes', async () => {
    const repository = new InMemoryIdentityRepository();
    const service = new BootstrapUserService(repository);

    await service.execute({
      clerkUserId: 'clerk_789',
      email: 'jack@example.com'
    });

    const result = await service.execute({
      clerkUserId: 'clerk_789',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    expect(result.user.name).toBe('Jack Sparrow');
    expect(result.workspace.id).toBe('workspace_1');
  });

  it('does not create duplicate workspaces when called repeatedly for the same clerk user', async () => {
    const repository = new InMemoryIdentityRepository();
    const service = new BootstrapUserService(repository);

    const first = await service.execute({
      clerkUserId: 'clerk_repeat',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    const second = await service.execute({
      clerkUserId: 'clerk_repeat',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    expect(second.workspace.id).toBe(first.workspace.id);
    expect(second.membership.role).toBe('owner');
  });
});
