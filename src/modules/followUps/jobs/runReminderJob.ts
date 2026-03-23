import { logger } from '../../../lib/logger/logger.js';
import type { EmailService } from '../infrastructure/email.service.js';
import { FollowUpService } from '../application/followUp.service.js';

export async function runReminderJob(
  followUpService: FollowUpService,
  emailService: EmailService
): Promise<void> {
  const dueFollowUps = await followUpService.getDueFollowUps();

  for (const followUp of dueFollowUps) {
    try {
      await emailService.sendFollowUpReminder(
        followUp.userId,
        followUp.opportunityId
      );

      await followUpService.markAsSent([followUp.id]);
    } catch (err) {
      logger.error(
        { err, followUpId: followUp.id },
        'Failed to send follow-up reminder'
      );
    }
  }
}
