import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaOpportunityRepository } from '../../../modules/opportunities/infrastructure/prisma-opportunity.repository.js';
import { createPrismaTestClient } from '../helpers/prisma-test-client.js';
import { resetDatabase } from '../helpers/reset-db.js';
import {
  seedFollowUp,
  seedOpportunity,
  seedUser,
  seedWorkspace,
  seedWorkspaceMember
} from '../helpers/seed-test-data.js';

const testDb = createPrismaTestClient('opportunities');
const repository = new PrismaOpportunityRepository(testDb.prisma);

describe('PrismaOpportunityRepository reads integration', () => {
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

  it('lists only opportunities from the requested workspace', async () => {
    const ctx1 = await seedWorkspaceContext('Jack', 'jack@example.com');
    const ctx2 = await seedWorkspaceContext('Will', 'will@example.com');

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Proposal 1',
      status: 'draft'
    });

    await seedOpportunity(testDb.prisma, {
      workspaceId: ctx2.workspace.id,
      createdByUserId: ctx2.user.id,
      title: 'Proposal 2',
      status: 'draft'
    });

    const rows = await repository.listByWorkspace({
      workspaceId: ctx1.workspace.id,
      view: 'all'
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe('Proposal 1');
  });

  it('returns due opportunities when view is due', async () => {
    const ctx = await seedWorkspaceContext('Jack', 'jack@example.com');

    const dueOpportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx.workspace.id,
      createdByUserId: ctx.user.id,
      title: 'Due Proposal',
      status: 'sent'
    });

    const upcomingOpportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx.workspace.id,
      createdByUserId: ctx.user.id,
      title: 'Upcoming Proposal',
      status: 'sent'
    });

    await seedFollowUp(testDb.prisma, {
      opportunityId: dueOpportunity.id,
      userId: ctx.user.id,
      dueAt: new Date(Date.now() - 1000),
      status: 'pending'
    });

    await seedFollowUp(testDb.prisma, {
      opportunityId: upcomingOpportunity.id,
      userId: ctx.user.id,
      dueAt: new Date(Date.now() + 60_000),
      status: 'pending'
    });

    const rows = await repository.listByWorkspace({
      workspaceId: ctx.workspace.id,
      view: 'due'
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe('Due Proposal');
  });

  it('returns upcoming opportunities when view is upcoming', async () => {
    const ctx = await seedWorkspaceContext('Jack', 'jack@example.com');

    const dueOpportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx.workspace.id,
      createdByUserId: ctx.user.id,
      title: 'Due Proposal',
      status: 'sent'
    });

    const upcomingOpportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx.workspace.id,
      createdByUserId: ctx.user.id,
      title: 'Upcoming Proposal',
      status: 'sent'
    });

    await seedFollowUp(testDb.prisma, {
      opportunityId: dueOpportunity.id,
      userId: ctx.user.id,
      dueAt: new Date(Date.now() - 1000),
      status: 'pending'
    });

    await seedFollowUp(testDb.prisma, {
      opportunityId: upcomingOpportunity.id,
      userId: ctx.user.id,
      dueAt: new Date(Date.now() + 60_000),
      status: 'pending'
    });

    const rows = await repository.listByWorkspace({
      workspaceId: ctx.workspace.id,
      view: 'upcoming'
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe('Upcoming Proposal');
  });

  it('returns one opportunity only within the requested workspace', async () => {
    const ctx1 = await seedWorkspaceContext('Jack', 'jack@example.com');
    const ctx2 = await seedWorkspaceContext('Will', 'will@example.com');

    const target = await seedOpportunity(testDb.prisma, {
      workspaceId: ctx1.workspace.id,
      createdByUserId: ctx1.user.id,
      title: 'Proposal 1',
      status: 'draft'
    });

    const found = await repository.findByIdInWorkspace({
      workspaceId: ctx1.workspace.id,
      opportunityId: target.id
    });

    const missing = await repository.findByIdInWorkspace({
      workspaceId: ctx2.workspace.id,
      opportunityId: target.id
    });

    expect(found?.id).toBe(target.id);
    expect(missing).toBeNull();
  });
});
