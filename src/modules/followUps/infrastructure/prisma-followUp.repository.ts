import type { PrismaClient } from '../../../generated/prisma/client.js';
import type { FollowUpRepository } from './followUp.repository.js';
import type {
  CreateFollowUpInput,
  DueFollowUpQuery,
  FollowUpRecord,
  MarkFollowUpsAsSentInput
} from '../domain/followUp.types.js';

type PrismaFollowUpRepositoryClient = Pick<PrismaClient, 'followUp'>;

export class PrismaFollowUpRepository implements FollowUpRepository {
  constructor(private readonly prisma: PrismaFollowUpRepositoryClient) {}

  async createMany(followUps: CreateFollowUpInput[]): Promise<void> {
    await this.prisma.followUp.createMany({
      data: followUps.map((followUp) => ({
        ...(followUp.id ? { id: followUp.id } : {}),
        opportunityId: followUp.opportunityId,
        userId: followUp.userId,
        dueAt: followUp.dueAt,
        sentAt: followUp.sentAt ?? null,
        status: followUp.status ?? 'pending'
      }))
    });
  }

  async findDue(query: DueFollowUpQuery): Promise<FollowUpRecord[]> {
    const rows = await this.prisma.followUp.findMany({
      where: {
        dueAt: { lte: query.dueAtLte },
        ...(query.status ? { status: query.status } : {})
      }
    });

    return rows.map((row) => ({
      id: row.id,
      opportunityId: row.opportunityId,
      userId: row.userId,
      dueAt: row.dueAt,
      sentAt: row.sentAt,
      status: row.status as FollowUpRecord['status']
    }));
  }

  async markAsSent(input: MarkFollowUpsAsSentInput): Promise<void> {
    await this.prisma.followUp.updateMany({
      where: {
        id: { in: input.ids }
      },
      data: {
        status: 'sent',
        sentAt: input.sentAt
      }
    });
  }
}
