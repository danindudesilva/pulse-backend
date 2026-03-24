import type {
  CreateOpportunityInput,
  GetOpportunityInput,
  ListOpportunitiesInput,
  OpportunitySummary,
  UpdateOpportunityStatusInput
} from '../../../modules/opportunities/domain/opportunity.types.js';
import type { OpportunityRepository } from '../../../modules/opportunities/infrastructure/opportunity.repository.js';

export class InMemoryOpportunityRepository implements OpportunityRepository {
  public readonly opportunities: OpportunitySummary[] = [];

  async create(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    const created: OpportunitySummary = {
      id: `opp_${this.opportunities.length + 1}`,
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
      nextFollowUpAt: null,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
      updatedAt: new Date('2026-03-24T10:00:00.000Z')
    };

    this.opportunities.push(created);

    return created;
  }

  async listByWorkspace(
    input: ListOpportunitiesInput
  ): Promise<OpportunitySummary[]> {
    let results = this.opportunities.filter(
      (item) => item.workspaceId === input.workspaceId
    );

    if (input.status) {
      results = results.filter((item) => item.status === input.status);
    }

    if (input.view === 'due') {
      const now = Date.now();
      results = results.filter(
        (item) =>
          item.nextFollowUpAt !== null && item.nextFollowUpAt.getTime() <= now
      );
    }

    if (input.view === 'upcoming') {
      const now = Date.now();
      results = results.filter(
        (item) =>
          item.nextFollowUpAt !== null && item.nextFollowUpAt.getTime() > now
      );
    }

    return results;
  }

  async findByIdInWorkspace(
    input: GetOpportunityInput
  ): Promise<OpportunitySummary | null> {
    return (
      this.opportunities.find(
        (item) =>
          item.id === input.opportunityId &&
          item.workspaceId === input.workspaceId
      ) ?? null
    );
  }

  async updateStatus(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary | null> {
    const existing = this.opportunities.find(
      (item) =>
        item.id === input.opportunityId &&
        item.workspaceId === input.workspaceId
    );

    if (!existing) {
      return null;
    }

    existing.status = input.status;
    existing.updatedAt = new Date('2026-03-24T11:00:00.000Z');

    if (input.status === 'sent') {
      existing.quoteSentAt = input.quoteSentAt ?? null;
    }

    return existing;
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
      nextFollowUpAt: null,
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      updatedAt: new Date('2026-03-22T10:00:00.000Z')
    };
  }

  async listByWorkspace(
    _input: ListOpportunitiesInput
  ): Promise<OpportunitySummary[]> {
    return [];
  }

  async findByIdInWorkspace(
    _input: GetOpportunityInput
  ): Promise<OpportunitySummary | null> {
    return null;
  }

  async updateStatus(
    _input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary | null> {
    return null;
  }
}
