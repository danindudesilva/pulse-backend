import type { CreateOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class StubCreateOpportunityService implements CreateOpportunityExecutor {
  async execute(input: CreateOpportunityInput): Promise<OpportunitySummary> {
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
}
