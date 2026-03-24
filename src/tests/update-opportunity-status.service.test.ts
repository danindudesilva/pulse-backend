import { describe, expect, it } from 'vitest';
import { UpdateOpportunityStatusService } from '../modules/opportunities/application/update-opportunity-status.service.js';
import {
  InvalidOpportunityStatusTransitionError,
  OpportunityNotFoundError,
  QuoteSentAtRequiredError
} from '../modules/opportunities/domain/opportunity.errors.js';
import type { OpportunityRepository } from '../modules/opportunities/infrastructure/opportunity.repository.js';
import type {
  CreateOpportunityInput,
  GetOpportunityInput,
  ListOpportunitiesInput,
  OpportunitySummary,
  UpdateOpportunityStatusInput
} from '../modules/opportunities/domain/opportunity.types.js';

class InMemoryOpportunityRepository implements OpportunityRepository {
  constructor(private readonly opportunity: OpportunitySummary | null) {}

  async create(_input: CreateOpportunityInput): Promise<OpportunitySummary> {
    throw new Error('Not implemented');
  }

  async listByWorkspace(
    _input: ListOpportunitiesInput
  ): Promise<OpportunitySummary[]> {
    return [];
  }

  async findByIdInWorkspace(
    _input: GetOpportunityInput
  ): Promise<OpportunitySummary | null> {
    return this.opportunity;
  }

  async updateStatus(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary | null> {
    if (!this.opportunity) return null;

    return {
      ...this.opportunity,
      status: input.status,
      quoteSentAt:
        input.status === 'sent'
          ? (input.quoteSentAt ?? null)
          : this.opportunity.quoteSentAt
    };
  }
}

function buildOpportunity(
  status: OpportunitySummary['status']
): OpportunitySummary {
  return {
    id: 'opp_1',
    workspaceId: 'ws_1',
    createdByUserId: 'user_1',
    title: 'Proposal',
    companyName: null,
    contactName: null,
    contactEmail: null,
    valueAmount: null,
    currency: null,
    notes: null,
    status,
    quoteSentAt: null,
    nextFollowUpAt: null,
    createdAt: new Date('2026-03-24T10:00:00.000Z'),
    updatedAt: new Date('2026-03-24T10:00:00.000Z')
  };
}

describe('UpdateOpportunityStatusService', () => {
  it('updates a valid status transition', async () => {
    const repository = new InMemoryOpportunityRepository(
      buildOpportunity('sent')
    );
    const service = new UpdateOpportunityStatusService(repository);

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: 'opp_1',
      status: 'replied'
    });

    expect(result.status).toBe('replied');
  });

  it('requires quoteSentAt when transitioning to sent', async () => {
    const repository = new InMemoryOpportunityRepository(
      buildOpportunity('draft')
    );
    const service = new UpdateOpportunityStatusService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: 'opp_1',
        status: 'sent'
      })
    ).rejects.toBeInstanceOf(QuoteSentAtRequiredError);
  });

  it('rejects invalid status transitions', async () => {
    const repository = new InMemoryOpportunityRepository(
      buildOpportunity('draft')
    );
    const service = new UpdateOpportunityStatusService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: 'opp_1',
        status: 'won'
      })
    ).rejects.toBeInstanceOf(InvalidOpportunityStatusTransitionError);
  });

  it('throws when opportunity is not found', async () => {
    const repository = new InMemoryOpportunityRepository(null);
    const service = new UpdateOpportunityStatusService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: 'opp_missing',
        status: 'won'
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });
});
