import { describe, expect, it } from 'vitest';
import {
  ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS,
  canTransitionOpportunityStatus
} from '../modules/opportunities/domain/opportunity-status-transitions.js';

describe('opportunity status transitions', () => {
  it('allows valid transitions', () => {
    expect(canTransitionOpportunityStatus('draft', 'sent')).toBe(true);
    expect(canTransitionOpportunityStatus('sent', 'replied')).toBe(true);
    expect(canTransitionOpportunityStatus('replied', 'won')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionOpportunityStatus('draft', 'won')).toBe(false);
    expect(canTransitionOpportunityStatus('won', 'draft')).toBe(false);
    expect(canTransitionOpportunityStatus('lost', 'sent')).toBe(false);
  });

  it('defines no outgoing transitions for terminal states', () => {
    expect(ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS.won).toEqual([]);
    expect(ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS.lost).toEqual([]);
  });
});
