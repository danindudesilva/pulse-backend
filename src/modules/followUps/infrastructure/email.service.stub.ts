export interface EmailService {
  sendFollowUpReminder(userId: string, opportunityId: string): Promise<void>;
}

export class StubEmailService implements EmailService {
  async sendFollowUpReminder(userId: string, opportunityId: string) {
    console.log(
      `Stub: send reminder to ${userId} for opportunity ${opportunityId}`
    );
  }
}
