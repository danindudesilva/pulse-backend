import { OpportunityNotFoundError } from '../domain/opportunity.errors.js';
import type {
  GetOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from '../infrastructure/opportunity.repository.js';

export class GetOpportunityService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(input: GetOpportunityInput): Promise<OpportunitySummary> {
    const opportunity =
      await this.opportunityRepository.findByIdInWorkspace(input);

    if (!opportunity) {
      throw new OpportunityNotFoundError();
    }

    return opportunity;
  }
}
