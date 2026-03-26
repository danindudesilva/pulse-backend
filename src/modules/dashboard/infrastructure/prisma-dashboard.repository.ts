import type { PrismaClient } from '../../../generated/prisma/client.js';
import type { DashboardSummary } from '../domain/dashboard-summary.types.js';
import type { DashboardRepository } from './dashboard.repository.js';

type PrismaDashboardRepositoryClient = Pick<
  PrismaClient,
  'opportunity' | 'followUp'
>;

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaDashboardRepositoryClient) {}

  async getSummary(workspaceId: string): Promise<DashboardSummary> {
    const now = new Date();

    const [all, draft, sent, replied, won, lost, paused, due, upcoming] =
      await Promise.all([
        this.prisma.opportunity.count({
          where: { workspaceId }
        }),
        this.prisma.opportunity.count({
          where: { workspaceId, status: 'draft' }
        }),
        this.prisma.opportunity.count({
          where: { workspaceId, status: 'sent' }
        }),
        this.prisma.opportunity.count({
          where: { workspaceId, status: 'replied' }
        }),
        this.prisma.opportunity.count({
          where: { workspaceId, status: 'won' }
        }),
        this.prisma.opportunity.count({
          where: { workspaceId, status: 'lost' }
        }),
        this.prisma.opportunity.count({
          where: { workspaceId, status: 'paused' }
        }),
        this.prisma.followUp.count({
          where: {
            status: 'pending',
            dueAt: { lte: now },
            opportunity: {
              workspaceId
            }
          }
        }),
        this.prisma.followUp.count({
          where: {
            status: 'pending',
            dueAt: { gt: now },
            opportunity: {
              workspaceId
            }
          }
        })
      ]);

    return {
      opportunities: {
        all,
        draft,
        sent,
        replied,
        won,
        lost,
        paused
      },
      followUps: {
        due,
        upcoming
      }
    };
  }
}
