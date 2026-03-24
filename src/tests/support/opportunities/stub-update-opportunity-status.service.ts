import type { UpdateOpportunityStatusExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  OpportunitySummary,
  UpdateOpportunityStatusInput
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class StubUpdateOpportunityStatusService implements UpdateOpportunityStatusExecutor {
  async execute(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary> {
    return {
      id: input.opportunityId,
      workspaceId: input.workspaceId,
      createdByUserId: 'user_1',
      title: 'Proposal 1',
      companyName: null,
      contactName: null,
      contactEmail: null,
      valueAmount: null,
      currency: null,
      notes: null,
      status: input.status,
      quoteSentAt: input.quoteSentAt ?? null,
      nextFollowUpAt: null,
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      updatedAt: new Date('2026-03-22T10:00:00.000Z')
    };
  }
}
