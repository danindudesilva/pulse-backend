import type { GetDashboardSummaryExecutor } from '../../../modules/dashboard/api/dashboard.route.js';
import type { DashboardSummary } from '../../../modules/dashboard/domain/dashboard-summary.types.js';

export class CapturingStubGetDashboardSummaryService implements GetDashboardSummaryExecutor {
  public lastWorkspaceId: string | null = null;

  async execute(workspaceId: string): Promise<DashboardSummary> {
    this.lastWorkspaceId = workspaceId;

    return {
      opportunities: {
        all: 0,
        draft: 0,
        sent: 0,
        replied: 0,
        won: 0,
        lost: 0,
        paused: 0
      },
      followUps: {
        due: 0,
        upcoming: 0
      }
    };
  }
}
