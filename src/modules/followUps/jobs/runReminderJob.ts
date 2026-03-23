import { logger } from '../../../lib/logger/logger.js';
import type { FollowUpService } from '../application/followUp.service.js';
import type { EmailService } from '../infrastructure/email.service.stub.js';

export async function runReminderJob(
  followUpService: FollowUpService,
  emailService: EmailService
) {
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
      // Continue sending other follow-ups
    }
  }
}
