import { logger } from '../../../lib/logger/logger.js';
import type { EmailService } from './email.service.js';

export class StubEmailService implements EmailService {
  async sendFollowUpReminder(
    userId: string,
    opportunityId: string
  ): Promise<void> {
    logger.info({ userId, opportunityId }, 'Stub follow-up reminder sent');
  }
}
