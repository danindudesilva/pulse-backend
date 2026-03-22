import {
  InvalidInitialOpportunityStatusError,
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

    if (input.status === 'sent' && !input.quoteSentAt) {
      throw new QuoteSentAtRequiredError();
    }

    return this.opportunityRepository.create(input);
  }
}
