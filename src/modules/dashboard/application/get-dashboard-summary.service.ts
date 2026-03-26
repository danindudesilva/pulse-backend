import type { DashboardSummary } from '../domain/dashboard-summary.types.js';
import type { DashboardRepository } from '../infrastructure/dashboard.repository.js';

export class GetDashboardSummaryService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(workspaceId: string): Promise<DashboardSummary> {
    return this.dashboardRepository.getSummary(workspaceId);
  }
}
