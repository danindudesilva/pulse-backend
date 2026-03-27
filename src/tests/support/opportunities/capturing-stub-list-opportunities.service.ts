import type { ListOpportunitiesExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  ListOpportunitiesInput,
  PaginatedOpportunities
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class CapturingStubListOpportunitiesService implements ListOpportunitiesExecutor {
  public lastInput: ListOpportunitiesInput | null = null;

  async execute(
    input: ListOpportunitiesInput
  ): Promise<PaginatedOpportunities> {
    this.lastInput = input;

    return {
      items: [],
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        totalItems: 0,
        totalPages: 0
      }
    };
  }
}
