import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { UpdateOpportunityStatusService } from '../../../modules/opportunities/application/update-opportunity-status.service.js';
import { InvalidOpportunityStatusTransitionError } from '../../../modules/opportunities/domain/opportunity.errors.js';
import { PrismaOpportunityRepository } from '../../../modules/opportunities/infrastructure/prisma-opportunity.repository.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedOpportunity,
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

const testDb = createPrismaTestClient('opportunities');
const repository = new PrismaOpportunityRepository(testDb.prisma);
const service = new UpdateOpportunityStatusService(repository);

describe('UpdateOpportunityStatusService integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  it('updates a valid status transition', async () => {
    const user = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack'
    });

    const workspace = await seedWorkspace(testDb.prisma, {
      name: "Jack's Workspace"
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner'
    });

    const opportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: workspace.id,
      createdByUserId: user.id,
      title: 'Proposal',
      status: 'sent'
    });

    const updated = await service.execute({
      workspaceId: workspace.id,
      opportunityId: opportunity.id,
      status: 'replied'
    });

    expect(updated.status).toBe('replied');
  });

  it('rejects invalid status transitions', async () => {
    const user = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack'
    });

    const workspace = await seedWorkspace(testDb.prisma, {
      name: "Jack's Workspace"
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner'
    });

    const opportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: workspace.id,
      createdByUserId: user.id,
      title: 'Proposal',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: workspace.id,
        opportunityId: opportunity.id,
        status: 'won'
      })
    ).rejects.toBeInstanceOf(InvalidOpportunityStatusTransitionError);
  });
});
