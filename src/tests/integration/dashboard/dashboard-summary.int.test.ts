import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaDashboardRepository } from '../../../modules/dashboard/infrastructure/prisma-dashboard.repository.js';
import { GetDashboardSummaryService } from '../../../modules/dashboard/application/get-dashboard-summary.service.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedFollowUp,
  seedOpportunity,
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

const testDb = createPrismaTestClient('dashboard');

describe('Dashboard summary integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  async function seedWorkspaceContext(name: string, email: string) {
    const user = await seedUser(testDb.prisma, {
      clerkUserId: `clerk_${email}`,
      email,
      name
    });

    const workspace = await seedWorkspace(testDb.prisma, {
      name: `${name}'s Workspace`
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner'
    });

    return { user, workspace };
  }

  it('returns workspace-scoped dashboard counts', async () => {
    const ctx1 = await seedWorkspaceContext('Jack', 'jack@example.com');
    const ctx2 = await seedWorkspaceContext('Will', 'will@example.com');

    const draft = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Draft Proposal',
      status: 'draft'
    });

    const sent = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Sent Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-24T10:00:00.000Z')
    });

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Replied Proposal',
      status: 'replied'
    });

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Won Proposal',
      status: 'won'
    });

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Lost Proposal',
      status: 'lost'
    });

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Paused Proposal',
      status: 'paused'
    });

    await seedFollowUp(testDb.prisma, {
      opportunityId: sent.id,
      userId: ctx1.user.id,
      dueAt: new Date(Date.now() - 1000),
      status: 'pending'
    });

    await seedFollowUp(testDb.prisma, {
      opportunityId: draft.id,
      userId: ctx1.user.id,
      dueAt: new Date(Date.now() + 60_000),
      status: 'pending'
    });

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx2.workspace.id,
      createdByUserId: ctx2.user.id,
      title: 'Other Workspace Proposal',
      status: 'draft'
    });

    const repository = new PrismaDashboardRepository(testDb.prisma);
    const service = new GetDashboardSummaryService(repository);

    const summary = await service.execute(ctx1.workspace.id);

    expect(summary).toEqual({
      opportunities: {
        all: 6,
        draft: 1,
        sent: 1,
        replied: 1,
        won: 1,
        lost: 1,
        paused: 1
      },
      followUps: {
        due: 1,
        upcoming: 1
      }
    });
  });

  it('returns zero buckets when the workspace has no data', async () => {
    const ctx = await seedWorkspaceContext('Empty', 'empty@example.com');

    const repository = new PrismaDashboardRepository(testDb.prisma);
    const service = new GetDashboardSummaryService(repository);

    const summary = await service.execute(ctx.workspace.id);

    expect(summary).toEqual({
      opportunities: {
        all: 0,
        draft: 0,
        sent: 0,
        replied: 0,
        won: 0,
        lost: 0,
        paused: 0
      },
      followUps: {
        due: 0,
        upcoming: 0
      }
    });
  });
});
