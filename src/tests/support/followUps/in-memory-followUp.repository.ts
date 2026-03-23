import type { FollowUpRepository } from '../../../modules/followUps/infrastructure/followUp.repository.js';
import type {
  CreateFollowUpInput,
  DueFollowUpQuery,
  FollowUpRecord,
  MarkFollowUpsAsSentInput
} from '../../../modules/followUps/domain/followUp.types.js';

export class InMemoryFollowUpRepository implements FollowUpRepository {
  public readonly created: FollowUpRecord[] = [];

  async createMany(followUps: CreateFollowUpInput[]): Promise<void> {
    const normalized: FollowUpRecord[] = followUps.map((followUp) => ({
      id: followUp.id ?? crypto.randomUUID(),
      opportunityId: followUp.opportunityId,
      userId: followUp.userId,
      dueAt: followUp.dueAt,
      sentAt: followUp.sentAt ?? null,
      status: followUp.status ?? 'pending'
    }));

    this.created.push(...normalized);
  }

  async findDue(query: DueFollowUpQuery): Promise<FollowUpRecord[]> {
    return this.created.filter((item) => {
      const matchesStatus = query.status ? item.status === query.status : true;
      const matchesDueAt = item.dueAt <= query.dueAtLte;

      return matchesStatus && matchesDueAt;
    });
  }

  async markAsSent(input: MarkFollowUpsAsSentInput): Promise<void> {
    for (const item of this.created) {
      if (!input.ids.includes(item.id)) continue;

      item.status = 'sent';
      item.sentAt = input.sentAt;
    }
  }
}
