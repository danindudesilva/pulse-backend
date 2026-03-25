import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateOpportunityWithFollowUpsService } from '../../../modules/opportunities/application/create-opportunity-with-followups.service.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

const testDb = createPrismaTestClient('opportunities');

describe('CreateOpportunityWithFollowUpsService integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  it('creates an opportunity and three default follow-ups', async () => {
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

    const service = new CreateOpportunityWithFollowUpsService(
      testDb.prisma as never
    );

    const result = await service.execute({
      workspaceId: workspace.id,
      createdByUserId: user.id,
      title: 'Proposal',
      status: 'draft'
    });

    const opportunity = await testDb.prisma.opportunity.findUnique({
      where: { id: result.id }
    });

    const followUps = await testDb.prisma.followUp.findMany({
      where: { opportunityId: result.id },
      orderBy: { dueAt: 'asc' }
    });

    expect(opportunity).not.toBeNull();
    expect(followUps).toHaveLength(3);
    expect(followUps.every((item) => item.userId === user.id)).toBe(true);
    expect(followUps.every((item) => item.status === 'pending')).toBe(true);
  });

  it('rolls back the opportunity when follow-up generation fails inside the transaction', async () => {
    const user = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_2',
      email: 'will@example.com',
      name: 'Will'
    });

    const workspace = await seedWorkspace(testDb.prisma, {
      name: "Will's Workspace"
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner'
    });

    await expect(
      testDb.prisma.$transaction(async (tx) => {
        const opportunity = await tx.opportunity.create({
          data: {
            workspaceId: workspace.id,
            createdByUserId: user.id,
            title: 'Rollback Proposal',
            status: 'draft'
          }
        });

        await tx.followUp.createMany({
          data: [
            {
              opportunityId: opportunity.id,
              userId: user.id,
              dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              status: 'pending'
            }
          ]
        });

        throw new Error('forced rollback');
      })
    ).rejects.toThrow('forced rollback');

    const rolledBackOpportunity = await testDb.prisma.opportunity.findFirst({
      where: { title: 'Rollback Proposal' }
    });

    const rolledBackFollowUps = await testDb.prisma.followUp.findMany({
      where: {
        userId: user.id
      }
    });

    expect(rolledBackOpportunity).toBeNull();
    expect(rolledBackFollowUps).toHaveLength(0);
  });
});
