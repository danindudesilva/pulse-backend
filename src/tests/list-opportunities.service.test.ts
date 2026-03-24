import { describe, expect, it } from 'vitest';
import { ListOpportunitiesService } from '../modules/opportunities/application/list-opportunities.service.js';
import { InMemoryOpportunityRepository } from './support/opportunities/test-opportunity-repositories.js';

describe('ListOpportunitiesService', () => {
  it('lists opportunities for the requested workspace', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new ListOpportunitiesService(repository);

    await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal 1',
      status: 'draft'
    });

    await repository.create({
      workspaceId: 'ws_2',
      createdByUserId: 'user_2',
      title: 'Proposal 2',
      status: 'draft'
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      view: 'all'
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Proposal 1');
  });

  it('filters by status', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new ListOpportunitiesService(repository);

    await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Draft Proposal',
      status: 'draft'
    });

    await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Sent Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-24T10:00:00.000Z')
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      status: 'sent'
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Sent Proposal');
  });

  it('returns only due opportunities when view is due', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new ListOpportunitiesService(repository);

    const due = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Due Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-24T10:00:00.000Z')
    });

    const upcoming = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Upcoming Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-24T10:00:00.000Z')
    });

    due.nextFollowUpAt = new Date(Date.now() - 1000);
    upcoming.nextFollowUpAt = new Date(Date.now() + 60_000);

    const result = await service.execute({
      workspaceId: 'ws_1',
      view: 'due'
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Due Proposal');
  });

  it('returns only upcoming opportunities when view is upcoming', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new ListOpportunitiesService(repository);

    const due = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Due Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-24T10:00:00.000Z')
    });

    const upcoming = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Upcoming Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-24T10:00:00.000Z')
    });

    due.nextFollowUpAt = new Date(Date.now() - 1000);
    upcoming.nextFollowUpAt = new Date(Date.now() + 60_000);

    const result = await service.execute({
      workspaceId: 'ws_1',
      view: 'upcoming'
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Upcoming Proposal');
  });
});
