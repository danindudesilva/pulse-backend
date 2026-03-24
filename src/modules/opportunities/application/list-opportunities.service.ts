import type {
  ListOpportunitiesInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from '../infrastructure/opportunity.repository.js';

export class ListOpportunitiesService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(input: ListOpportunitiesInput): Promise<OpportunitySummary[]> {
    return this.opportunityRepository.listByWorkspace(input);
  }
}
