import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../../../modules/opportunities/domain/opportunity.types.js';
import type { OpportunityRepository } from '../../../modules/opportunities/infrastructure/opportunity.repository.js';

export class InMemoryOpportunityRepository implements OpportunityRepository {
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

export class SpyOpportunityRepository implements OpportunityRepository {
  public createCallCount = 0;
  public lastInput: CreateOpportunityInput | null = null;

  async create(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    this.createCallCount += 1;
    this.lastInput = input;

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
