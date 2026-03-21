import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createBootstrapTestApp } from './support/identity.ts/create-bootstrap-test-app.js';
import { createApp } from '../app/app.js';
import { createTestAppDependencies } from './support/app/test-app-deps.js';
import { StubBootstrapUserService } from './support/identity.ts/stub-bootstrap-user-service.js';

describe('POST /api/auth/bootstrap', () => {
  it('returns bootstrapped user and workspace details', async () => {
    const app = createBootstrapTestApp();

    const response = await request(app).post('/api/auth/bootstrap').send({
      clerkUserId: 'clerk_123',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: 'user_1',
        clerkUserId: 'clerk_123',
        email: 'jack@example.com',
        name: 'Jack Sparrow'
      },
      workspace: {
        id: 'workspace_1',
        name: "Jack's Workspace"
      },
      membership: {
        role: 'owner'
      }
    });
  });

  it('omits name from the service input when name is undefined', async () => {
    class CapturingStubBootstrapUserService extends StubBootstrapUserService {
      public lastInput: unknown;

      override async execute(
        input: Parameters<StubBootstrapUserService['execute']>[0]
      ) {
        this.lastInput = input;
        return super.execute(input);
      }
    }

    const service = new CapturingStubBootstrapUserService();

    const app = createApp(
      createTestAppDependencies({
        bootstrapUserService: service
      })
    );

    const response = await request(app).post('/api/auth/bootstrap').send({
      clerkUserId: 'clerk_123',
      email: 'jack@example.com'
    });

    expect(response.status).toBe(200);
    expect(service.lastInput).toEqual({
      clerkUserId: 'clerk_123',
      email: 'jack@example.com'
    });
  });

  it('returns 400 when clerkUserId is empty', async () => {
    const app = createBootstrapTestApp();

    const response = await request(app).post('/api/auth/bootstrap').send({
      clerkUserId: '',
      email: 'jack@example.com',
      name: 'Jack Sparrow'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            clerkUserId: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 when email is invalid', async () => {
    const app = createBootstrapTestApp();

    const response = await request(app).post('/api/auth/bootstrap').send({
      clerkUserId: 'clerk_123',
      email: 'not-an-email',
      name: 'Jack Sparrow'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            email: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 when name is blank but present', async () => {
    const app = createBootstrapTestApp();

    const response = await request(app).post('/api/auth/bootstrap').send({
      clerkUserId: 'clerk_123',
      email: 'jack@example.com',
      name: '   '
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            name: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 400 with fieldErrors for multiple invalid fields', async () => {
    const app = createBootstrapTestApp();

    const response = await request(app).post('/api/auth/bootstrap').send({
      clerkUserId: '',
      email: 'bad-email'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: {
            clerkUserId: expect.any(Array),
            email: expect.any(Array)
          }
        }
      }
    });
  });

  it('returns 405 for unsupported methods', async () => {
    const app = createBootstrapTestApp();

    const response = await request(app).get('/api/auth/bootstrap');

    expect(response.status).toBe(405);
    expect(response.body).toEqual({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method GET not allowed for /api/auth/bootstrap',
        details: null
      }
    });
  });
});
