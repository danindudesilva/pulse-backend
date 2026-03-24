import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createOpportunityTestApp } from './support/opportunities/create-opportunity-test-app.js';
import { CapturingStubCreateOpportunityService } from './support/opportunities/capturing-stub-create-opportunity-service.js';
import { InvalidInitialOpportunityStatusError } from '../modules/opportunities/domain/opportunity.errors.js';
import { StubCreateOpportunityService } from './support/opportunities/stub-create-opportunity-service.js';

describe('POST /api/opportunities', () => {
  const defaultAuthContext = {
    clerkUserId: 'clerk_123',
    userId: 'user_1',
    workspaceId: 'ws_1'
  };
  let app: ReturnType<typeof createOpportunityTestApp>;

  beforeEach(() => {
    app = createOpportunityTestApp(
      { createOpportunityService: new StubCreateOpportunityService() },
      defaultAuthContext
    );
  });

  it('returns 401 when auth context is missing', async () => {
    const app = createOpportunityTestApp();
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft'
    });

    expect(response.status).toBe(401);
  });

  it('derives workspaceId and createdByUserId from auth context', async () => {
    const service = new CapturingStubCreateOpportunityService();
    const app = createOpportunityTestApp(
      { createOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft'
    });

    expect(response.status).toBe(201);
    expect(service.lastInput).toMatchObject({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });
  });

  it('rejects client-supplied workspaceId and createdByUserId fields', async () => {
    const response = await request(app).post('/api/opportunities').send({
      workspaceId: 'steered_workspace',
      createdByUserId: 'steered_user',
      title: 'Proposal',
      status: 'draft'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual({
      fieldErrors: {},
      formErrors: [expect.stringContaining('Unrecognized keys')]
    });
  });

  it('creates a draft opportunity', async () => {
    const response = await request(app).post('/api/opportunities').send({
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
    const app = createOpportunityTestApp(
      { createOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app).post('/api/opportunities').send({
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
    const response = await request(app).post('/api/opportunities').send({
      status: 'draft'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when title is blank', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: '   ',
      status: 'draft'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            title: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 when the service rejects a non-createable initial status', async () => {
    class RejectingCreateOpportunityService {
      async execute() {
        throw new InvalidInitialOpportunityStatusError();
      }
    }

    const app = createOpportunityTestApp(
      {
        createOpportunityService:
          new RejectingCreateOpportunityService() as never
      },
      defaultAuthContext
    );

    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Initial opportunity status must be either draft or sent',
        details: null
      }
    });
  });

  it('returns 400 when contactEmail is invalid', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft',
      contactEmail: 'not-an-email'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when status is sent without quoteSentAt', async () => {
    const response = await request(app).post('/api/opportunities').send({
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

  it('returns 400 when quoteSentAt is provided for a non-sent status', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft',
      quoteSentAt: '2026-03-22T10:00:00.000Z'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            quoteSentAt: ['quoteSentAt is only allowed when status is sent']
          }
        }
      }
    });
  });

  it('returns 400 when status is missing', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            status: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 when valueAmount is not a valid decimal string', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft',
      valueAmount: '12.345'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            valueAmount: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 when currency is not exactly 3 characters', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft',
      currency: 'GB'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            currency: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 when quoteSentAt is not a valid ISO datetime', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'sent',
      quoteSentAt: 'not-a-date'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            quoteSentAt: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 with fieldErrors for multiple invalid fields', async () => {
    const response = await request(app).post('/api/opportunities').send({
      title: '',
      status: 'draft',
      currency: 'X'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            title: expect.any(Array),
            currency: expect.any(Array)
          }
        }
      }
    });
  });

  it('parses quoteSentAt into a Date before calling the service', async () => {
    const service = new CapturingStubCreateOpportunityService();
    const app = createOpportunityTestApp(
      { createOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'sent',
      quoteSentAt: '2026-03-22T10:00:00.000Z'
    });

    expect(response.status).toBe(201);
    expect(service.lastInput).not.toBeNull();
    expect(service.lastInput?.quoteSentAt).toBeInstanceOf(Date);
    expect(service.lastInput?.quoteSentAt?.toISOString()).toBe(
      '2026-03-22T10:00:00.000Z'
    );
  });

  it('omits optional fields from the service input when they are undefined', async () => {
    const service = new CapturingStubCreateOpportunityService();
    const app = createOpportunityTestApp(
      { createOpportunityService: service },
      defaultAuthContext
    );

    const response = await request(app).post('/api/opportunities').send({
      title: 'Proposal',
      status: 'draft'
    });

    expect(response.status).toBe(201);
    expect(service.lastInput).toEqual({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });
  });

  it('returns 405 for unsupported methods', async () => {
    const response = await request(app).delete('/api/opportunities');

    expect(response.status).toBe(405);
    expect(response.body).toEqual({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method DELETE not allowed for /api/opportunities',
        details: null
      }
    });
  });
});
