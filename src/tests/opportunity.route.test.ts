import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createOpportunityTestApp } from './support/opportunities/create-opportunity-test-app.js';
import { CapturingStubCreateOpportunityService } from './support/opportunities/capturing-stub-create-opportunity-service.js';

describe('POST /api/opportunities', () => {
  it('creates a draft opportunity', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).post('/api/opportunities').send({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Website redesign proposal',
      status: 'draft'
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 'opp_1',
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Website redesign proposal',
      status: 'draft'
    });
  });

  it('normalizes currency to uppercase', async () => {
    const service = new CapturingStubCreateOpportunityService();
    const app = createOpportunityTestApp(service);

    const response = await request(app).post('/api/opportunities').send({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft',
      currency: 'gbp'
    });

    expect(response.status).toBe(201);
    expect(service.lastInput).toMatchObject({
      currency: 'GBP'
    });
  });

  it('returns 400 when title is missing', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).post('/api/opportunities').send({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      status: 'draft'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when contactEmail is invalid', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).post('/api/opportunities').send({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft',
      contactEmail: 'not-an-email'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when status is sent without quoteSentAt', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).post('/api/opportunities').send({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'sent'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            quoteSentAt: ['quoteSentAt is required when status is sent']
          }
        }
      }
    });
  });

  it('returns 405 for unsupported methods', async () => {
    const app = createOpportunityTestApp();

    const response = await request(app).get('/api/opportunities');

    expect(response.status).toBe(405);
    expect(response.body).toEqual({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method GET not allowed for /api/opportunities',
        details: null
      }
    });
  });
});
