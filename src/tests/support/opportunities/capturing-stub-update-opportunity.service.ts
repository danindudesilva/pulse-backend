import type { UpdateOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  OpportunitySummary,
  UpdateOpportunityInput
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class CapturingStubUpdateOpportunityService implements UpdateOpportunityExecutor {
  public lastInput: UpdateOpportunityInput | null = null;

  async execute(input: UpdateOpportunityInput): Promise<OpportunitySummary> {
    this.lastInput = input;

    return {
      id: input.opportunityId,
      workspaceId: input.workspaceId,
      createdByUserId: 'user_1',
      title: input.title ?? 'Proposal 1',
      companyName:
        input.companyName !== undefined ? input.companyName : 'Black Pearl Ltd',
      contactName:
        input.contactName !== undefined ? input.contactName : 'Jack Sparrow',
      contactEmail:
        input.contactEmail !== undefined
          ? input.contactEmail
          : 'jack@blackpearl.com',
      valueAmount:
        input.valueAmount !== undefined ? input.valueAmount : '2500.00',
      currency: input.currency !== undefined ? input.currency : 'GBP',
      notes: input.notes !== undefined ? input.notes : 'Initial notes',
      status: 'draft',
      quoteSentAt: null,
      nextFollowUpAt: null,
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      updatedAt: new Date('2026-03-24T10:00:00.000Z')
    };
  }
}
