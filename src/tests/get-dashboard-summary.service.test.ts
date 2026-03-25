import { describe, expect, it } from 'vitest';
import { GetDashboardSummaryService } from '../modules/dashboard/application/get-dashboard-summary.service.js';
import type { DashboardSummary } from '../modules/dashboard/domain/dashboard-summary.types.js';
import type { DashboardRepository } from '../modules/dashboard/infrastructure/dashboard.repository.js';

class SpyDashboardRepository implements DashboardRepository {
  public lastWorkspaceId: string | null = null;

  async getSummary(workspaceId: string): Promise<DashboardSummary> {
    this.lastWorkspaceId = workspaceId;

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

describe('GetDashboardSummaryService', () => {
  it('returns the repository summary for the workspace', async () => {
    const repository = new SpyDashboardRepository();
    const service = new GetDashboardSummaryService(repository);

    const result = await service.execute('ws_1');

    expect(repository.lastWorkspaceId).toBe('ws_1');
    expect(result).toEqual({
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
    });
  });
});
