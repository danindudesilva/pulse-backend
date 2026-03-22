import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { ConflictError } from '../../../lib/errors/app-error.js';
import { PrismaIdentityRepository } from '../../../modules/identity/infrastructure/prisma-identity.repository.js';
import {
  disconnectPrismaTestClient,
  prismaTestClient
} from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import { seedUser } from '../helpers/seed-test-data.js';

describe('PrismaIdentityRepository integration', () => {
  const repository = new PrismaIdentityRepository(prismaTestClient);

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectPrismaTestClient();
  });

  it('creates a new user, workspace, and owner membership', async () => {
    const result = await repository.bootstrapUser({
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    expect(result.user.clerkUserId).toBe('clerk_1');
    expect(result.workspace.name).toBe("Jack's Workspace");
    expect(result.membership.role).toBe('owner');

    const membership = await prismaTestClient.workspaceMember.findFirst({
      where: {
        userId: result.user.id,
        workspaceId: result.workspace.id
      }
    });

    expect(membership).not.toBeNull();
  });

  it('maps duplicate email conflicts to ConflictError', async () => {
    await seedUser({
      clerkUserId: 'existing_clerk',
      email: 'existing@example.com',
      name: 'Existing User'
    });

    await expect(
      repository.bootstrapUser({
        clerkUserId: 'new_clerk',
        email: 'existing@example.com',
        name: 'Another User'
      })
    ).rejects.toThrow(ConflictError);

    await expect(
      repository.bootstrapUser({
        clerkUserId: 'new_clerk',
        email: 'existing@example.com',
        name: 'Another User'
      })
    ).rejects.toThrow('A user with this email already exists');
  });
});
