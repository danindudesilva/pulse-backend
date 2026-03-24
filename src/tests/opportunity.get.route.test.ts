import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createOpportunityTestApp } from './support/opportunities/create-opportunity-test-app.js';
import { CapturingStubGetOpportunityService } from './support/opportunities/capturing-stub-get-opportunity.service.js';

describe('GET /api/opportunities/:opportunityId', () => {
  const defaultAuthContext = {
    clerkUserId: 'clerk_123',
    userId: 'user_1',
    workspaceId: 'ws_1'
  };

  it('returns 401 when auth context is missing', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).get('/api/opportunities/opp_1');

    expect(response.status).toBe(401);
  });

  it('derives workspaceId from auth context when fetching one opportunity', async () => {
    const service = new CapturingStubGetOpportunityService();
    const app = createOpportunityTestApp(
      { getOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app).get('/api/opportunities/opp_1');

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      opportunityId: 'opp_1'
    });
  });
});
