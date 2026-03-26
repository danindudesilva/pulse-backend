import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app/app.js';
import { createTestAppDependencies } from './support/app/test-app-deps.js';
import { CapturingStubGetDashboardSummaryService } from './support/dashboard/capturing-stub-get-dashboard-summary.service.js';

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) =>
    next()
}));

import { getAuth } from '@clerk/express';

describe('dashboard app smoke test', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getAuth).mockReturnValue({
      userId: 'clerk_123'
    } as never);
  });

  it('serves GET /api/dashboard/summary through the full app stack', async () => {
    const service = new CapturingStubGetDashboardSummaryService();

    const app = createApp(
      createTestAppDependencies({
        getDashboardSummaryService: service
      })
    );

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(200);
    expect(service.lastWorkspaceId).toBe('workspace_1');
    expect(response.body).toEqual({
      opportunities: {
        all: 0,
        draft: 0,
        sent: 0,
        replied: 0,
        won: 0,
        lost: 0,
        paused: 0
      },
      followUps: {
        due: 0,
        upcoming: 0
      }
    });
  });

  it('returns 401 when the full app receives an unauthenticated request', async () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: null
    } as never);

    const app = createApp(createTestAppDependencies());

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(401);
  });
});
