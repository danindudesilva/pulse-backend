import type { GetDashboardSummaryExecutor } from '../../../modules/dashboard/api/dashboard.route.js';
import type { DashboardSummary } from '../../../modules/dashboard/domain/dashboard-summary.types.js';

export class StubGetDashboardSummaryService implements GetDashboardSummaryExecutor {
  async execute(_workspaceId: string): Promise<DashboardSummary> {
    return {
      opportunities: {
        all: 10,
        draft: 2,
        sent: 3,
        replied: 1,
        won: 2,
        lost: 1,
        paused: 1
      },
      followUps: {
        due: 4,
        upcoming: 6
      }
    };
  }
}
