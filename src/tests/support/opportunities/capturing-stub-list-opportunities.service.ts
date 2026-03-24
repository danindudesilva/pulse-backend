import type { ListOpportunitiesExecutor } from '../../../modules/opportunities/api/opportunity.route.js';
import type {
  ListOpportunitiesInput,
  OpportunitySummary
} from '../../../modules/opportunities/domain/opportunity.types.js';

export class CapturingStubListOpportunitiesService implements ListOpportunitiesExecutor {
  public lastInput: ListOpportunitiesInput | null = null;

  async execute(input: ListOpportunitiesInput): Promise<OpportunitySummary[]> {
    this.lastInput = input;

    return [];
  }
}
