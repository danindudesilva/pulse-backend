import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app/app.js';
import { createTestAppDependencies } from './support/app/test-app-deps.js';
import { CapturingStubGetDashboardSummaryService } from './support/dashboard/capturing-stub-get-dashboard-summary.service.js';

describe('GET /api/dashboard/summary', () => {
  it('returns 401 when auth context is missing', async () => {
    const app = createApp(
      createTestAppDependencies({
        resolveAuthContextService: {
          async execute() {
            throw new Error('should not be called');
          }
        }
      })
    );

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(401);
  });

  it('uses workspaceId from auth context', async () => {
    const service = new CapturingStubGetDashboardSummaryService();

    const app = createApp(
      createTestAppDependencies({
        getDashboardSummaryService: service
      })
    );

    const response = await request(app).get('/api/dashboard/summary');

    expect(response.status).toBe(200);
    expect(service.lastWorkspaceId).toBe('workspace_1');
  });

  it('returns the summary payload', async () => {
    const app = createApp(createTestAppDependencies());

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
    const app = createApp(createTestAppDependencies());

    const response = await request(app).post('/api/dashboard/summary');

    expect(response.status).toBe(405);
  });
});
