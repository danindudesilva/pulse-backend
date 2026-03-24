import type { GetOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  GetOpportunityInput,
  OpportunitySummary
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class StubGetOpportunityService implements GetOpportunityExecutor {
  async execute(_input: GetOpportunityInput): Promise<OpportunitySummary> {
    return {
      id: 'opp_1',
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal 1',
      companyName: null,
      contactName: null,
      contactEmail: null,
      valueAmount: null,
      currency: null,
      notes: null,
      status: 'draft',
      quoteSentAt: null,
      nextFollowUpAt: null,
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      updatedAt: new Date('2026-03-22T10:00:00.000Z')
    };
  }
}
