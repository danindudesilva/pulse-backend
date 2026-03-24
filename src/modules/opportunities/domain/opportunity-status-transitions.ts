import type { OpportunityStatus } from '../../../generated/prisma/client.js';

export const ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS: Record<
  OpportunityStatus,
  OpportunityStatus[]
> = {
  draft: ['sent', 'lost', 'paused'],
  sent: ['replied', 'won', 'lost', 'paused'],
  replied: ['won', 'lost', 'paused'],
  paused: ['sent', 'lost'],
  won: [],
  lost: []
};

export function canTransitionOpportunityStatus(
  from: OpportunityStatus,
  to: OpportunityStatus
): boolean {
  return ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS[from].includes(to);
}
