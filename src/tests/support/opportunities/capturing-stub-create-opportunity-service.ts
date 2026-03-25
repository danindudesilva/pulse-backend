import type { CreateOpportunityExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class CapturingStubCreateOpportunityService implements CreateOpportunityExecutor {
  public lastInput: CreateOpportunityInput | null = null;

  async execute(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    this.lastInput = input;

    return {
      id: 'opp_1',
      workspaceId: input.workspaceId,
      createdByUserId: input.createdByUserId,
      title: input.title,
      companyName: input.companyName ?? null,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
      valueAmount:
        input.valueAmount !== undefined && input.valueAmount !== null
          ? Number(input.valueAmount).toFixed(2)
          : null,
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
