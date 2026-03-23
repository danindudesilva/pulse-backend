import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { FollowUpService } from '../../../modules/followUps/application/followUp.service.js';
import { StubEmailService } from '../../../modules/followUps/infrastructure/stub-email.service.js';
import { PrismaFollowUpRepository } from '../../../modules/followUps/infrastructure/prisma-followUp.repository.js';
import { runReminderJob } from '../../../modules/followUps/jobs/runReminderJob.js';
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

async function seedOpportunityContext() {
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

  const opportunity = await seedOpportunity(testDb.prisma, {
    workspaceId: workspace.id,
    createdByUserId: user.id,
    title: 'Proposal',
    status: 'draft'
  });

  return { user, workspace, opportunity };
}

describe('PrismaFollowUpRepository integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  it('creates follow-ups for a valid opportunity', async () => {
    const { user, opportunity } = await seedOpportunityContext();

    await repository.createMany([
      {
        id: 'f1',
        opportunityId: opportunity.id,
        userId: user.id,
        dueAt: new Date(Date.now() + 1000),
        status: 'pending'
      }
    ]);

    const rows = await testDb.prisma.followUp.findMany({
      where: { opportunityId: opportunity.id }
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.userId).toBe(user.id);
    expect(rows[0]?.status).toBe('pending');
  });

  it('returns only due pending follow-ups through the service', async () => {
    const { user, opportunity } = await seedOpportunityContext();
    const service = new FollowUpService(repository);

    await repository.createMany([
      {
        id: 'f1',
        opportunityId: opportunity.id,
        userId: user.id,
        dueAt: new Date(Date.now() - 1000),
        status: 'pending'
      },
      {
        id: 'f2',
        opportunityId: opportunity.id,
        userId: user.id,
        dueAt: new Date(Date.now() + 60_000),
        status: 'pending'
      },
      {
        id: 'f3',
        opportunityId: opportunity.id,
        userId: user.id,
        dueAt: new Date(Date.now() - 1000),
        status: 'sent'
      }
    ]);

    const due = await service.getDueFollowUps();

    expect(due).toHaveLength(1);
    expect(due[0]?.id).toBe('f1');
  });

  it('marks due follow-ups as sent after running the reminder job', async () => {
    const { user, opportunity } = await seedOpportunityContext();
    const service = new FollowUpService(repository);
    const emailService = new StubEmailService();

    await repository.createMany([
      {
        id: 'f1',
        opportunityId: opportunity.id,
        userId: user.id,
        dueAt: new Date(Date.now() - 1000),
        status: 'pending'
      }
    ]);

    await runReminderJob(service, emailService);

    const updated = await testDb.prisma.followUp.findMany({
      where: { id: 'f1' }
    });

    expect(updated).toHaveLength(1);
    expect(updated[0]?.status).toBe('sent');
    expect(updated[0]?.sentAt).toBeTruthy();
  });
});
