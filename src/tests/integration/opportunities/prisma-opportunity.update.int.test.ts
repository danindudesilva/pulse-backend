import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { UpdateOpportunityService } from '../../../modules/opportunities/application/update-opportunity.service.js';
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
const service = new UpdateOpportunityService(repository);

describe('UpdateOpportunityService integration', () => {
  beforeEach(async () => {
    await resetDatabase(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  it('updates only editable fields within the workspace', async () => {
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
      title: 'Original Title',
      companyName: 'Old Company',
      contactName: 'Old Name',
      contactEmail: 'old@example.com',
      valueAmount: '100.00',
      currency: 'GBP',
      notes: 'Old notes',
      status: 'draft'
    });

    const updated = await service.execute({
      workspaceId: workspace.id,
      opportunityId: opportunity.id,
      title: 'Updated Title',
      companyName: 'New Company',
      notes: 'New notes'
    });

    expect(updated.title).toBe('Updated Title');
    expect(updated.companyName).toBe('New Company');
    expect(updated.notes).toBe('New notes');
    expect(updated.contactName).toBe('Old Name');
    expect(updated.contactEmail).toBe('old@example.com');
    expect(updated.valueAmount).toBe('100.00');
    expect(updated.currency).toBe('GBP');
  });

  it('persists null clearing of optional fields', async () => {
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
      title: 'Original Title',
      companyName: 'Old Company',
      contactName: 'Old Name',
      contactEmail: 'old@example.com',
      valueAmount: '100.00',
      currency: 'GBP',
      notes: 'Old notes',
      status: 'draft'
    });

    const updated = await service.execute({
      workspaceId: workspace.id,
      opportunityId: opportunity.id,
      companyName: null,
      contactName: null,
      contactEmail: null,
      valueAmount: null,
      currency: null,
      notes: null
    });

    expect(updated.companyName).toBeNull();
    expect(updated.contactName).toBeNull();
    expect(updated.contactEmail).toBeNull();
    expect(updated.valueAmount).toBeNull();
    expect(updated.currency).toBeNull();
    expect(updated.notes).toBeNull();
  });

  it('does not update an opportunity in another workspace', async () => {
    const user1 = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_1',
      email: 'jack@example.com',
      name: 'Jack'
    });

    const user2 = await seedUser(testDb.prisma, {
      clerkUserId: 'clerk_2',
      email: 'will@example.com',
      name: 'Will'
    });

    const workspace1 = await seedWorkspace(testDb.prisma, {
      name: "Jack's Workspace"
    });

    const workspace2 = await seedWorkspace(testDb.prisma, {
      name: "Will's Workspace"
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace1.id,
      userId: user1.id,
      role: 'owner'
    });

    await seedWorkspaceMember(testDb.prisma, {
      workspaceId: workspace2.id,
      userId: user2.id,
      role: 'owner'
    });

    const opportunity = await seedOpportunity(testDb.prisma, {
      workspaceId: workspace1.id,
      createdByUserId: user1.id,
      title: 'Original Title',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: workspace2.id,
        opportunityId: opportunity.id,
        title: 'Updated Title'
      })
    ).rejects.toThrow('Opportunity not found');
    const unchanged = await testDb.prisma.opportunity.findUnique({
      where: { id: opportunity.id }
    });

    expect(unchanged?.title).toBe('Original Title');
  });
});
