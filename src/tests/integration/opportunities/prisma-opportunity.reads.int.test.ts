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
      view: 'all',
      page: 1,
      pageSize: 10
    });

    expect(rows.items).toHaveLength(1);
    expect(rows.items[0]?.title).toBe('Proposal 1');
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
      view: 'due',
      page: 1,
      pageSize: 10
    });

    expect(rows.items).toHaveLength(1);
    expect(rows.items[0]?.title).toBe('Due Proposal');
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
      view: 'upcoming',
      page: 1,
      pageSize: 10
    });

    expect(rows.items).toHaveLength(1);
    expect(rows.items[0]?.title).toBe('Upcoming Proposal');
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

  it('returns only the requested page of opportunities with pagination metadata', async () => {
    const ctx = await seedWorkspaceContext('Jack', 'jack@example.com');

    for (let i = 1; i <= 12; i += 1) {
      await seedOpportunity(testDb.prisma, {
        workspaceId: ctx.workspace.id,
        createdByUserId: ctx.user.id,
        title: `Proposal ${i}`,
        status: 'draft'
      });
    }

    const page1 = await repository.listByWorkspace({
      workspaceId: ctx.workspace.id,
      page: 1,
      pageSize: 5
    });

    const page3 = await repository.listByWorkspace({
      workspaceId: ctx.workspace.id,
      page: 3,
      pageSize: 5
    });

    expect(page1.items).toHaveLength(5);
    expect(page1.pagination).toEqual({
      page: 1,
      pageSize: 5,
      totalItems: 12,
      totalPages: 3
    });

    expect(page3.items).toHaveLength(2);
    expect(page3.pagination).toEqual({
      page: 3,
      pageSize: 5,
      totalItems: 12,
      totalPages: 3
    });
  });

  it('applies filters before pagination metadata is calculated', async () => {
    const ctx = await seedWorkspaceContext('Jack', 'jack@example.com');

    for (let i = 1; i <= 7; i += 1) {
      await seedOpportunity(testDb.prisma, {
        workspaceId: ctx.workspace.id,
        createdByUserId: ctx.user.id,
        title: `Sent Proposal ${i}`,
        status: 'sent'
      });
    }

    for (let i = 1; i <= 3; i += 1) {
      await seedOpportunity(testDb.prisma, {
        workspaceId: ctx.workspace.id,
        createdByUserId: ctx.user.id,
        title: `Draft Proposal ${i}`,
        status: 'draft'
      });
    }

    const result = await repository.listByWorkspace({
      workspaceId: ctx.workspace.id,
      page: 1,
      pageSize: 5,
      status: 'sent'
    });

    expect(result.items).toHaveLength(5);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 5,
      totalItems: 7,
      totalPages: 2
    });
  });

  it('returns zero totalPages when there are no matching opportunities', async () => {
    const ctx = await seedWorkspaceContext('Jack', 'jack@example.com');

    const result = await repository.listByWorkspace({
      workspaceId: ctx.workspace.id,
      page: 1,
      pageSize: 10,
      status: 'won'
    });

    expect(result.items).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0
    });
  });
});
