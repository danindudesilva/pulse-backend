import {
  InvalidInitialOpportunityStatusError,
  QuoteSentAtInFutureError,
  QuoteSentAtOnlyAllowedForSentStatusError,
  QuoteSentAtRequiredError
} from '../domain/opportunity.errors.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from '../infrastructure/opportunity.repository.js';

export class CreateOpportunityService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    if (input.status !== 'draft' && input.status !== 'sent') {
      throw new InvalidInitialOpportunityStatusError();
    }

    if (input.status !== 'sent' && input.quoteSentAt !== undefined) {
      throw new QuoteSentAtOnlyAllowedForSentStatusError();
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

    return this.opportunityRepository.create(input);
  }
}
