export interface EmailService {
  sendFollowUpReminder(userId: string, opportunityId: string): Promise<void>;
}
