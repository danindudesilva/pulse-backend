import { describe, expect, it } from 'vitest';
import { CreateOpportunityService } from '../modules/opportunities/application/create-opportunity.service.js';
import type { OpportunityRepository } from '../modules/opportunities/infrastructure/opportunity.repository.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../modules/opportunities/domain/opportunity.types.js';

class InMemoryOpportunityRepository implements OpportunityRepository {
  async create(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    return {
      id: 'opp_1',
      workspaceId: input.workspaceId,
      createdByUserId: input.createdByUserId,
      title: input.title,
      companyName: input.companyName ?? null,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
      valueAmount: input.valueAmount ?? null,
      currency: input.currency ?? null,
      notes: input.notes ?? null,
      status: input.status,
      quoteSentAt: input.quoteSentAt ?? null,
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      updatedAt: new Date('2026-03-22T10:00:00.000Z')
    };
  }
}

describe('CreateOpportunityService', () => {
  it('creates a draft opportunity', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Website redesign proposal',
      status: 'draft'
    });

    expect(result.title).toBe('Website redesign proposal');
    expect(result.status).toBe('draft');
    expect(result.quoteSentAt).toBeNull();
  });

  it('creates a sent opportunity when quoteSentAt is provided', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    const quoteSentAt = new Date('2026-03-22T09:00:00.000Z');

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Mobile app proposal',
      status: 'sent',
      quoteSentAt
    });

    expect(result.status).toBe('sent');
    expect(result.quoteSentAt).toEqual(quoteSentAt);
  });

  it('rejects non-createable initial statuses', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Invalid status opportunity',
        status: 'won'
      })
    ).rejects.toThrow(
      'Initial opportunity status must be either draft or sent'
    );
  });

  it('requires quoteSentAt when creating a sent opportunity', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Sent without timestamp',
        status: 'sent'
      })
    ).rejects.toThrow('quoteSentAt is required when status is sent');
  });
});
