import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaIdentityRepository } from '../../../modules/identity/infrastructure/prisma-identity.repository.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import { seedUser } from '../helpers/seed-test-data.js';
import { ConflictError } from '../../../lib/errors/app-error.js';

const testDb = createPrismaTestClient('identity');
const repository = new PrismaIdentityRepository(testDb.prisma);

describe('PrismaIdentityRepository integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
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

    const membership = await testDb.prisma.workspaceMember.findFirst({
      where: {
        userId: result.user.id,
        workspaceId: result.workspace.id
      }
    });

    expect(membership).not.toBeNull();
  });

  it('maps duplicate email conflicts to ConflictError', async () => {
    await seedUser(testDb.prisma, {
      clerkUserId: 'existing_clerk',
      email: 'existing@example.com',
      name: 'Existing User'
    });

    try {
      await repository.bootstrapUser({
        clerkUserId: 'new_clerk',
        email: 'existing@example.com',
        name: 'Another User'
      });

      throw new Error('Expected bootstrapUser to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect(error).toMatchObject({
        message: 'A user with this email already exists'
      });
    }
  });
});
