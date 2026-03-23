export type FollowUpStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export type FollowUpScheduleSource = {
  id: string;
  createdByUserId: string;
};

export type CreateFollowUpInput = {
  id?: string;
  opportunityId: string;
  userId: string;
  dueAt: Date;
  sentAt?: Date | null;
  status?: FollowUpStatus;
};

export type FollowUpRecord = {
  id: string;
  opportunityId: string;
  userId: string;
  dueAt: Date;
  sentAt: Date | null;
  status: FollowUpStatus;
};

export type DueFollowUpQuery = {
  dueAtLte: Date;
  status?: FollowUpStatus;
};

export type MarkFollowUpsAsSentInput = {
  ids: string[];
  sentAt: Date;
};
