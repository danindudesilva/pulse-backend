import type {
  CreateOpportunityInput,
  GetOpportunityInput,
  ListOpportunitiesInput,
  OpportunitySummary,
  UpdateOpportunityStatusInput
} from '../domain/opportunity.types.js';

export interface OpportunityRepository {
  create(input: CreateOpportunityInput): Promise<OpportunitySummary>;
  listByWorkspace(input: ListOpportunitiesInput): Promise<OpportunitySummary[]>;
  findByIdInWorkspace(
    input: GetOpportunityInput
  ): Promise<OpportunitySummary | null>;
  updateStatus(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary | null>;
}
