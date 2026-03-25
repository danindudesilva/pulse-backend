import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createDashboardTestApp } from './support/dashboard/create-dashboard-test-app.js';
import { CapturingStubGetDashboardSummaryService } from './support/dashboard/capturing-stub-get-dashboard-summary.service.js';

describe('GET /api/dashboard/summary', () => {
  const defaultAuthContext = {
    clerkUserId: 'clerk_123',
    userId: 'user_1',
    workspaceId: 'ws_1'
  };

  it('returns 401 when auth context is missing', async () => {
    const app = createDashboardTestApp();

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(401);
  });

  it('uses workspaceId from auth context', async () => {
    const service = new CapturingStubGetDashboardSummaryService();
    const app = createDashboardTestApp(service, defaultAuthContext);

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(200);
    expect(service.lastWorkspaceId).toBe('ws_1');
  });

  it('returns the summary payload', async () => {
    const app = createDashboardTestApp(undefined, defaultAuthContext);

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      opportunities: {
        all: 10,
        draft: 2,
        sent: 3,
        replied: 1,
        won: 2,
        lost: 1,
        paused: 1
      },
      followUps: {
        due: 4,
        upcoming: 6
      }
    });
  });

  it('returns 405 for unsupported methods', async () => {
    const app = createDashboardTestApp(undefined, defaultAuthContext);

    const response = await request(app).post('/api/dashboard/summary');

    expect(response.status).toBe(405);
  });
});
