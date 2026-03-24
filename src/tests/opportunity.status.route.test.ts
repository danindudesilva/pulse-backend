import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createOpportunityTestApp } from './support/opportunities/create-opportunity-test-app.js';
import { CapturingStubUpdateOpportunityStatusService } from './support/opportunities/capturing-stub-update-opportunity-status.service.js';
import { InvalidOpportunityStatusTransitionError } from '../modules/opportunities/domain/opportunity.errors.js';

describe('PATCH /api/opportunities/:opportunityId/status', () => {
  const defaultAuthContext = {
    clerkUserId: 'clerk_123',
    userId: 'user_1',
    workspaceId: 'ws_1'
  };

  it('returns 401 when auth context is missing', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app)
      .patch('/api/opportunities/opp_1/status')
      .send({ status: 'won' });

    expect(response.status).toBe(401);
  });

  it('derives workspaceId from auth context when updating status', async () => {
    const service = new CapturingStubUpdateOpportunityStatusService();
    const app = createOpportunityTestApp(
      { updateOpportunityStatusService: service },
      defaultAuthContext
    );

    const response = await request(app)
      .patch('/api/opportunities/opp_1/status')
      .send({ status: 'replied' });

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      opportunityId: 'opp_1',
      status: 'replied'
    });
  });

  it('parses quoteSentAt into a Date when updating status to sent', async () => {
    const service = new CapturingStubUpdateOpportunityStatusService();
    const app = createOpportunityTestApp(
      { updateOpportunityStatusService: service },
      defaultAuthContext
    );

    const response = await request(app)
      .patch('/api/opportunities/opp_1/status')
      .send({
        status: 'sent',
        quoteSentAt: '2026-03-24T10:00:00.000Z'
      });

    expect(response.status).toBe(200);
    expect(service.lastInput?.quoteSentAt).toBeInstanceOf(Date);
    expect(service.lastInput?.quoteSentAt?.toISOString()).toBe(
      '2026-03-24T10:00:00.000Z'
    );
  });

  it('returns 400 when status is sent without quoteSentAt', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app)
      .patch('/api/opportunities/opp_1/status')
      .send({ status: 'sent' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when the service rejects an invalid status transition', async () => {
    class RejectingUpdateOpportunityStatusService {
      async execute() {
        throw new InvalidOpportunityStatusTransitionError('draft', 'won');
      }
    }

    const app = createOpportunityTestApp(
      {
        updateOpportunityStatusService:
          new RejectingUpdateOpportunityStatusService() as never
      },
      defaultAuthContext
    );

    const response = await request(app)
      .patch('/api/opportunities/opp_1/status')
      .send({ status: 'won' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Cannot transition opportunity status from draft to won',
        details: null
      }
    });
  });
});
