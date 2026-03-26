import type { DashboardSummary } from '../domain/dashboard-summary.types.js';

export interface DashboardRepository {
  getSummary(workspaceId: string): Promise<DashboardSummary>;
}
