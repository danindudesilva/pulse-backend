import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';

export interface OpportunityRepository {
  create(input: CreateOpportunityInput): Promise<OpportunitySummary>;
}
