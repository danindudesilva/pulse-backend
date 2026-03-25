import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createOpportunityTestApp } from './support/opportunities/create-opportunity-test-app.js';
import { CapturingStubUpdateOpportunityService } from './support/opportunities/capturing-stub-update-opportunity.service.js';

describe('PATCH /api/opportunities/:opportunityId', () => {
  const defaultAuthContext = {
    clerkUserId: 'clerk_123',
    userId: 'user_1',
    workspaceId: 'ws_1'
  };

  it('returns 401 when auth context is missing', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ title: 'Updated Title' });

    expect(response.status).toBe(401);
  });

  it('derives workspaceId from auth context', async () => {
    const service = new CapturingStubUpdateOpportunityService();
    const app = createOpportunityTestApp(
      { updateOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ title: 'Updated Title' });

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      opportunityId: 'opp_1',
      title: 'Updated Title'
    });
  });

  it('normalizes currency to uppercase', async () => {
    const service = new CapturingStubUpdateOpportunityService();
    const app = createOpportunityTestApp(
      { updateOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ currency: 'gbp' });

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      opportunityId: 'opp_1',
      currency: 'GBP'
    });
  });

  it('allows null to clear optional fields', async () => {
    const service = new CapturingStubUpdateOpportunityService();
    const app = createOpportunityTestApp(
      { updateOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app).patch('/api/opportunities/opp_1').send({
      companyName: null,
      contactName: null,
      contactEmail: null,
      valueAmount: null,
      currency: null,
      notes: null
    });

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      opportunityId: 'opp_1',
      companyName: null,
      contactName: null,
      contactEmail: null,
      valueAmount: null,
      currency: null,
      notes: null
    });
  });

  it('returns 400 when body is empty', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when title is blank', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when contactEmail is invalid', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ contactEmail: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when valueAmount is not a valid decimal string', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ valueAmount: '12.345' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when currency is not exactly 3 characters', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app)
      .patch('/api/opportunities/opp_1')
      .send({ currency: 'GB' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when unsupported fields are provided', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).patch('/api/opportunities/opp_1').send({
      status: 'won',
      workspaceId: 'steered_workspace'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 405 for unsupported methods', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).put('/api/opportunities/opp_1');

    expect(response.status).toBe(405);
  });
});
