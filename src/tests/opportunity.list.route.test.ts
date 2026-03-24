import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createOpportunityTestApp } from './support/opportunities/create-opportunity-test-app.js';
import { CapturingStubListOpportunitiesService } from './support/opportunities/capturing-stub-list-opportunities.service.js';

describe('GET /api/opportunities', () => {
  const defaultAuthContext = {
    clerkUserId: 'clerk_123',
    userId: 'user_1',
    workspaceId: 'ws_1'
  };

  it('returns 401 when auth context is missing', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).get('/api/opportunities');

    expect(response.status).toBe(401);
  });

  it('derives workspaceId from auth context', async () => {
    const service = new CapturingStubListOpportunitiesService();
    const app = createOpportunityTestApp(
      { listOpportunitiesService: service },
      defaultAuthContext
    );

    const response = await request(app).get('/api/opportunities');

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1'
    });
  });

  it('passes view and status filters', async () => {
    const service = new CapturingStubListOpportunitiesService();
    const app = createOpportunityTestApp(
      { listOpportunitiesService: service },
      defaultAuthContext
    );

    const response = await request(app).get(
      '/api/opportunities?view=due&status=sent'
    );

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      view: 'due',
      status: 'sent'
    });
  });

  it('returns 400 for invalid view filter', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).get('/api/opportunities?view=invalid');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid status filter', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).get(
      '/api/opportunities?status=invalid'
    );

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
