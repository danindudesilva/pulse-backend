import type { EmailService } from '../../../modules/followUps/infrastructure/email.service.js';

export class RecordingEmailService implements EmailService {
  public readonly sent: Array<{ userId: string; opportunityId: string }> = [];

  async sendFollowUpReminder(
    userId: string,
    opportunityId: string
  ): Promise<void> {
    this.sent.push({ userId, opportunityId });
  }
}
