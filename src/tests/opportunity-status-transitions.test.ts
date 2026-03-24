import { describe, expect, it } from 'vitest';
import {
  ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS,
  canTransitionOpportunityStatus
} from '../modules/opportunities/domain/opportunity-status-transitions.js';

describe('canTransitionOpportunityStatus', () => {
  it('allows valid transitions from draft', () => {
    expect(canTransitionOpportunityStatus('draft', 'sent')).toBe(true);
    expect(canTransitionOpportunityStatus('draft', 'lost')).toBe(true);
    expect(canTransitionOpportunityStatus('draft', 'paused')).toBe(true);
  });

  it('rejects invalid transitions from draft', () => {
    expect(canTransitionOpportunityStatus('draft', 'replied')).toBe(false);
    expect(canTransitionOpportunityStatus('draft', 'won')).toBe(false);
    expect(canTransitionOpportunityStatus('draft', 'draft')).toBe(false);
  });

  it('allows valid transitions from sent', () => {
    expect(canTransitionOpportunityStatus('sent', 'replied')).toBe(true);
    expect(canTransitionOpportunityStatus('sent', 'won')).toBe(true);
    expect(canTransitionOpportunityStatus('sent', 'lost')).toBe(true);
    expect(canTransitionOpportunityStatus('sent', 'paused')).toBe(true);
  });

  it('rejects invalid transitions from sent', () => {
    expect(canTransitionOpportunityStatus('sent', 'draft')).toBe(false);
    expect(canTransitionOpportunityStatus('sent', 'sent')).toBe(false);
  });

  it('allows valid transitions from replied', () => {
    expect(canTransitionOpportunityStatus('replied', 'won')).toBe(true);
    expect(canTransitionOpportunityStatus('replied', 'lost')).toBe(true);
    expect(canTransitionOpportunityStatus('replied', 'paused')).toBe(true);
  });

  it('rejects invalid transitions from replied', () => {
    expect(canTransitionOpportunityStatus('replied', 'draft')).toBe(false);
    expect(canTransitionOpportunityStatus('replied', 'sent')).toBe(false);
    expect(canTransitionOpportunityStatus('replied', 'replied')).toBe(false);
  });

  it('allows valid transitions from paused', () => {
    expect(canTransitionOpportunityStatus('paused', 'sent')).toBe(true);
    expect(canTransitionOpportunityStatus('paused', 'lost')).toBe(true);
  });

  it('rejects invalid transitions from paused', () => {
    expect(canTransitionOpportunityStatus('paused', 'draft')).toBe(false);
    expect(canTransitionOpportunityStatus('paused', 'replied')).toBe(false);
    expect(canTransitionOpportunityStatus('paused', 'won')).toBe(false);
    expect(canTransitionOpportunityStatus('paused', 'paused')).toBe(false);
  });

  it('rejects all outgoing transitions from won', () => {
    expect(canTransitionOpportunityStatus('won', 'draft')).toBe(false);
    expect(canTransitionOpportunityStatus('won', 'sent')).toBe(false);
    expect(canTransitionOpportunityStatus('won', 'replied')).toBe(false);
    expect(canTransitionOpportunityStatus('won', 'lost')).toBe(false);
    expect(canTransitionOpportunityStatus('won', 'paused')).toBe(false);
    expect(canTransitionOpportunityStatus('won', 'won')).toBe(false);
  });

  it('rejects all outgoing transitions from lost', () => {
    expect(canTransitionOpportunityStatus('lost', 'draft')).toBe(false);
    expect(canTransitionOpportunityStatus('lost', 'sent')).toBe(false);
    expect(canTransitionOpportunityStatus('lost', 'replied')).toBe(false);
    expect(canTransitionOpportunityStatus('lost', 'won')).toBe(false);
    expect(canTransitionOpportunityStatus('lost', 'paused')).toBe(false);
    expect(canTransitionOpportunityStatus('lost', 'lost')).toBe(false);
  });

  it('keeps terminal states empty in the transition map', () => {
    expect(ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS.won).toEqual([]);
    expect(ALLOWED_OPPORTUNITY_STATUS_TRANSITIONS.lost).toEqual([]);
  });
});
