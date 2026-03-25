import { OpportunityNotFoundError } from '../domain/opportunity.errors.js';
import type {
  OpportunitySummary,
  UpdateOpportunityInput
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from '../infrastructure/opportunity.repository.js';

export class UpdateOpportunityService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(input: UpdateOpportunityInput): Promise<OpportunitySummary> {
    const updated = await this.opportunityRepository.updateInWorkspace(input);

    if (!updated) {
      throw new OpportunityNotFoundError();
    }

    return updated;
  }
}
