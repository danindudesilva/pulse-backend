import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { ConflictError } from '../../../lib/errors/app-error.js';
import { PrismaOpportunityRepository } from '../../../modules/opportunities/infrastructure/prisma-opportunity.repository.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

const testDb = createPrismaTestClient('opportunities');
const repository = new PrismaOpportunityRepository(testDb.prisma);

describe('PrismaOpportunityRepository integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  it('creates an opportunity when workspace and creator exist', async () => {
    const user = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    const workspace = await seedWorkspace(testDb.prisma, {
      name: "Jack's Workspace"
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner'
    });

    const result = await repository.create({
      workspaceId: workspace.id,
      createdByUserId: user.id,
      title: 'Website redesign proposal',
      status: 'draft'
    });

    expect(result.workspaceId).toBe(workspace.id);
    expect(result.createdByUserId).toBe(user.id);
    expect(result.title).toBe('Website redesign proposal');
    expect(result.status).toBe('draft');
  });

  it('maps missing workspace foreign key failures to ConflictError', async () => {
    const user = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    try {
      await repository.create({
        workspaceId: 'missing-workspace-id',
        createdByUserId: user.id,
        title: 'Proposal',
        status: 'draft'
      });

      throw new Error('Expected repository.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect(error).toMatchObject({
        message: 'User is not a member of the specified workspace'
      });
    }
  });

  it('maps missing creator foreign key failures to ConflictError', async () => {
    const workspace = await seedWorkspace(testDb.prisma, {
      name: "Jack's Workspace"
    });

    try {
      await repository.create({
        workspaceId: workspace.id,
        createdByUserId: 'missing-user-id',
        title: 'Proposal',
        status: 'draft'
      });

      throw new Error('Expected repository.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect(error).toMatchObject({
        message: 'User is not a member of the specified workspace'
      });
    }
  });

  it('rejects opportunity creation if creator is not a workspace member', async () => {
    const workspace = await seedWorkspace(testDb.prisma, {
      name: 'A Workspace'
    });
    const user = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    await expect(
      repository.create({
        workspaceId: workspace.id,
        createdByUserId: user.id,
        title: 'Proposal',
        status: 'draft'
      })
    ).rejects.toMatchObject({
      message: 'User is not a member of the specified workspace'
    });
  });
});
