import type {
  ListOpportunitiesInput,
  PaginatedOpportunities
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from '../infrastructure/opportunity.repository.js';

export class ListOpportunitiesService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(
    input: ListOpportunitiesInput
  ): Promise<PaginatedOpportunities> {
    return this.opportunityRepository.listByWorkspace(input);
  }
}
