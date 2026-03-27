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

  it('uses workspaceId from auth context, default page and pageSize values', async () => {
    const service = new CapturingStubListOpportunitiesService();
    const app = createOpportunityTestApp(
      { listOpportunitiesService: service },
      defaultAuthContext
    );

    const response = await request(app).get('/api/opportunities');

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      page: 1,
      pageSize: 10
    });
  });

  it('passes explicit page and pageSize values', async () => {
    const service = new CapturingStubListOpportunitiesService();
    const app = createOpportunityTestApp(
      { listOpportunitiesService: service },
      defaultAuthContext
    );

    const response = await request(app).get(
      '/api/opportunities?page=2&pageSize=5'
    );

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      page: 2,
      pageSize: 5
    });
  });

  it('passes page, pageSize, view and status filters together', async () => {
    const service = new CapturingStubListOpportunitiesService();
    const app = createOpportunityTestApp(
      { listOpportunitiesService: service },
      defaultAuthContext
    );

    const response = await request(app).get(
      '/api/opportunities?page=1&pageSize=20&view=due&status=sent'
    );

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      page: 1,
      pageSize: 20,
      view: 'due',
      status: 'sent'
    });
  });

  it('returns 400 when page is invalid', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).get('/api/opportunities?page=0');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when pageSize is invalid', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).get('/api/opportunities?pageSize=0');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when pageSize exceeds the maximum', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).get('/api/opportunities?pageSize=51');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns paginated response', async () => {
    const app = createOpportunityTestApp(undefined, defaultAuthContext);

    const response = await request(app).get('/api/opportunities');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          id: 'opp_1',
          workspaceId: 'ws_1',
          createdByUserId: 'user_1',
          title: 'Proposal 1',
          companyName: null,
          contactName: null,
          contactEmail: null,
          valueAmount: null,
          currency: null,
          notes: null,
          status: 'draft',
          quoteSentAt: null,
          nextFollowUpAt: null,
          createdAt: '2026-03-22T10:00:00.000Z',
          updatedAt: '2026-03-22T10:00:00.000Z'
        }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1
      }
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
