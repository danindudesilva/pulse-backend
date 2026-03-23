import { InvalidFollowUpIdsError } from '../domain/followUp.errors.js';
import { DEFAULT_FOLLOW_UP_CADENCE_DAYS } from '../domain/followUp-cadence.js';
import type {
  FollowUpRecord,
  FollowUpScheduleSource
} from '../domain/followUp.types.js';
import type { FollowUpRepository } from '../infrastructure/followUp.repository.js';

export class FollowUpService {
  constructor(private readonly followUpRepository: FollowUpRepository) {}

  async generateDefaultFollowUps(
    opportunity: FollowUpScheduleSource
  ): Promise<void> {
    const now = Date.now();

    await this.followUpRepository.createMany(
      DEFAULT_FOLLOW_UP_CADENCE_DAYS.map((days) => ({
        opportunityId: opportunity.id,
        userId: opportunity.createdByUserId,
        dueAt: new Date(now + days * 24 * 60 * 60 * 1000),
        status: 'pending'
      }))
    );
  }

  async getDueFollowUps(): Promise<FollowUpRecord[]> {
    return this.followUpRepository.findDue({
      dueAtLte: new Date(),
      status: 'pending'
    });
  }

  async markAsSent(followUpIds: string[]): Promise<void> {
    if (followUpIds.length === 0) {
      throw new InvalidFollowUpIdsError();
    }

    await this.followUpRepository.markAsSent({
      ids: followUpIds,
      sentAt: new Date()
    });
  }
}
