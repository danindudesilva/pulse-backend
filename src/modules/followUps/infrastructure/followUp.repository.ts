import type {
  CreateFollowUpInput,
  DueFollowUpQuery,
  FollowUpRecord,
  MarkFollowUpsAsSentInput
} from '../domain/followUp.types.js';

export interface FollowUpRepository {
  createMany(followUps: CreateFollowUpInput[]): Promise<void>;
  findDue(query: DueFollowUpQuery): Promise<FollowUpRecord[]>;
  markAsSent(input: MarkFollowUpsAsSentInput): Promise<void>;
}
