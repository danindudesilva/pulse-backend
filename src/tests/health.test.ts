import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app/app.js';
import { createTestAppDependencies } from './support/app/test-app-deps.js';

describe('health API', () => {
  const app = createApp(createTestAppDependencies());

  it('returns 200 OK for GET /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok'
    });
  });

  it('returns 405 for unsupported method on /health', async () => {
    const response = await request(app).post('/health');

    expect(response.status).toBe(405);
    expect(response.body).toEqual({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method POST not allowed for /health',
        details: null
      }
    });
  });

  it('returns 404 JSON for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
        details: null
      }
    });
    expect(response.headers['content-type']).toContain('application/json');
  });
});
