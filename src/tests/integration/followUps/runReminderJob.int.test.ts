import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { FollowUpService } from '../../../modules/followUps/application/followUp.service.js';
import { PrismaFollowUpRepository } from '../../../modules/followUps/infrastructure/prisma-followUp.repository.js';
import { runReminderJob } from '../../../modules/followUps/jobs/runReminderJob.js';
import { ThrowingEmailService } from '../../support/followUps/throwing-email.service.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedOpportunity,
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

const testDb = createPrismaTestClient('followups');
const repository = new PrismaFollowUpRepository(testDb.prisma);

describe('runReminderJob integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  it('continues processing other follow-ups when one email send fails', async () => {
    const user1 = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    const user2 = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_2',
      email: 'will@example.com',
      name: 'Will Turner'
    });

    const workspace = await seedWorkspace(testDb.prisma, {
      name: "Jack's Workspace"
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user1.id,
      role: 'owner'
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user2.id,
      role: 'member'
    });

    const opportunity1 = await seedOpportunity(testDb.prisma, {
      workspaceId: workspace.id,
      createdByUserId: user1.id,
      title: 'Proposal 1',
      status: 'draft'
    });

    const opportunity2 = await seedOpportunity(testDb.prisma, {
      workspaceId: workspace.id,
      createdByUserId: user2.id,
      title: 'Proposal 2',
      status: 'draft'
    });

    await repository.createMany([
      {
        id: 'f1',
        opportunityId: opportunity1.id,
        userId: user1.id,
        dueAt: new Date(Date.now() - 1000),
        status: 'pending'
      },
      {
        id: 'f2',
        opportunityId: opportunity2.id,
        userId: user2.id,
        dueAt: new Date(Date.now() - 1000),
        status: 'pending'
      }
    ]);

    const service = new FollowUpService(repository);
    const emailService = new ThrowingEmailService(user1.id);

    await runReminderJob(service, emailService);

    const rows = await testDb.prisma.followUp.findMany({
      orderBy: { id: 'asc' }
    });

    expect(rows).toHaveLength(2);

    const first = rows.find((row) => row.id === 'f1');
    const second = rows.find((row) => row.id === 'f2');

    expect(first?.status).toBe('pending');
    expect(first?.sentAt).toBeNull();

    expect(second?.status).toBe('sent');
    expect(second?.sentAt).toBeTruthy();
  });
});
