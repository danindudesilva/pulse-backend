import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { ConflictError } from '../../../lib/errors/app-error.js';
import { PrismaOpportunityRepository } from '../../../modules/opportunities/infrastructure/prisma-opportunity.repository.js';
import {
  disconnectPrismaTestClient,
  prismaTestClient
} from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

describe('PrismaOpportunityRepository integration', () => {
  const repository = new PrismaOpportunityRepository(prismaTestClient);

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectPrismaTestClient();
  });

  it('creates an opportunity when workspace and creator exist', async () => {
    const user = await seedUser({
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    const workspace = await seedWorkspace({
      name: "Jack's Workspace"
    });

    await seedWorkspaceMember({
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
    const user = await seedUser({
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    await expect(
      repository.create({
        workspaceId: 'missing-workspace-id',
        createdByUserId: user.id,
        title: 'Proposal',
        status: 'draft'
      })
    ).rejects.toThrow(ConflictError);

    await expect(
      repository.create({
        workspaceId: 'missing-workspace-id',
        createdByUserId: user.id,
        title: 'Proposal',
        status: 'draft'
      })
    ).rejects.toThrow('Referenced workspace does not exist');
  });

  it('maps missing creator foreign key failures to ConflictError', async () => {
    const workspace = await seedWorkspace({
      name: "Jack's Workspace"
    });

    await expect(
      repository.create({
        workspaceId: workspace.id,
        createdByUserId: 'missing-user-id',
        title: 'Proposal',
        status: 'draft'
      })
    ).rejects.toThrow(ConflictError);

    await expect(
      repository.create({
        workspaceId: workspace.id,
        createdByUserId: 'missing-user-id',
        title: 'Proposal',
        status: 'draft'
      })
    ).rejects.toThrow('Referenced user does not exist');
  });

  it.skip('rejects creating an opportunity when the creator is not a member of the workspace', async () => {
    // This will be enabled in PR 7 after membership integrity is enforced.
  });
});
