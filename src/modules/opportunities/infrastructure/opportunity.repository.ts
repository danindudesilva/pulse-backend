import type {
  CreateOpportunityInput,
  GetOpportunityInput,
  ListOpportunitiesInput,
  OpportunitySummary,
  PaginatedOpportunities,
  UpdateOpportunityInput,
  UpdateOpportunityStatusInput
} from '../domain/opportunity.types.js';

export interface OpportunityRepository {
  create(input: CreateOpportunityInput): Promise<OpportunitySummary>;
  listByWorkspace(
    input: ListOpportunitiesInput
  ): Promise<PaginatedOpportunities>;
  findByIdInWorkspace(
    input: GetOpportunityInput
  ): Promise<OpportunitySummary | null>;
  updateStatus(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary | null>;
  updateInWorkspace(
    input: UpdateOpportunityInput
  ): Promise<OpportunitySummary | null>;
}
