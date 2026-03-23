import type { EmailService } from '../../../modules/followUps/infrastructure/email.service.js';

export class ThrowingEmailService implements EmailService {
  constructor(private readonly failingUserId: string) {}

  async sendFollowUpReminder(
    userId: string,
    _opportunityId: string
  ): Promise<void> {
    if (userId === this.failingUserId) {
      throw new Error('Simulated email failure');
    }
  }
}
