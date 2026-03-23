import type {
  Opportunity,
  FollowUp
} from '../../../generated/prisma/client.js';
import type { PrismaFollowUpRepository } from '../infrastructure/prisma-followUp.repository.js';

export class FollowUpService {
  constructor(private followUpRepo: PrismaFollowUpRepository) {}

  async generateDefaultFollowUps(opportunity: Opportunity) {
    const defaultCadenceDays = [3, 7, 14];

    const followUps = defaultCadenceDays.map((days) => ({
      opportunityId: opportunity.id,
      userId: opportunity.createdByUserId,
      dueAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      status: 'pending'
    }));

    await this.followUpRepo.createMany(followUps);
  }

  async getDueFollowUps(): Promise<FollowUp[]> {
    const now = new Date();
    return this.followUpRepo.findMany({
      where: { dueAt: { lte: now }, status: 'pending' }
    });
  }

  async markAsSent(followUpIds: string[]) {
    await this.followUpRepo.updateMany({
      where: { id: { in: followUpIds } },
      data: { status: 'sent', sentAt: new Date() }
    });
  }
}
