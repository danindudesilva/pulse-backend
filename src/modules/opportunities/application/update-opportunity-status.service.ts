import {
  InvalidOpportunityStatusTransitionError,
  OpportunityNotFoundError,
  QuoteSentAtInFutureError,
  QuoteSentAtRequiredError
} from '../domain/opportunity.errors.js';
import { canTransitionOpportunityStatus } from '../domain/opportunity-status-transitions.js';
import type {
  OpportunitySummary,
  UpdateOpportunityStatusInput
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from '../infrastructure/opportunity.repository.js';

export class UpdateOpportunityStatusService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary> {
    const existing = await this.opportunityRepository.findByIdInWorkspace({
      workspaceId: input.workspaceId,
      opportunityId: input.opportunityId
    });

    if (!existing) {
      throw new OpportunityNotFoundError();
    }

    if (!canTransitionOpportunityStatus(existing.status, input.status)) {
      throw new InvalidOpportunityStatusTransitionError(
        existing.status,
        input.status
      );
    }

    if (input.status === 'sent' && !input.quoteSentAt) {
      throw new QuoteSentAtRequiredError();
    }

    if (
      input.status === 'sent' &&
      input.quoteSentAt &&
      input.quoteSentAt.getTime() > Date.now()
    ) {
      throw new QuoteSentAtInFutureError();
    }

    const updated = await this.opportunityRepository.updateStatus(input);

    if (!updated) {
      throw new OpportunityNotFoundError();
    }

    return updated;
  }
}
