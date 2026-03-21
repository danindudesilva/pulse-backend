import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorMiddleware } from '../lib/http/error-middleware.js';
import { createBootstrapRouter } from '../modules/identity/api/bootstrap.route.js';
import type { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../modules/identity/domain/bootstrap-user.types.js';

class MockBootstrapUserService implements Pick<
  BootstrapUserService,
  'execute'
> {
  async execute(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    return {
      user: {
        id: 'user_1',
        clerkUserId: input.clerkUserId,
        email: input.email,
        name: input.name ?? null
      },
      workspace: {
        id: 'workspace_1',
        name: "Jack's Workspace"
      },
      membership: {
        role: 'owner'
      }
    };
  }
}

describe('POST /api/bootstrap', () => {
  it('returns bootstrapped user and workspace details', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/bootstrap',
      createBootstrapRouter(
        new MockBootstrapUserService() as BootstrapUserService
      )
    );
    app.use(errorMiddleware);

    const response = await request(app).post('/api/bootstrap').send({
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

  it('returns 400 for invalid input', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/bootstrap',
      createBootstrapRouter(
        new MockBootstrapUserService() as BootstrapUserService
      )
    );
    app.use(errorMiddleware);

    const response = await request(app).post('/api/bootstrap').send({
      clerkUserId: '',
      email: 'not-an-email'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 405 for unsupported methods', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/bootstrap',
      createBootstrapRouter(
        new MockBootstrapUserService() as BootstrapUserService
      )
    );
    app.use(errorMiddleware);

    const response = await request(app).get('/api/bootstrap');

    expect(response.status).toBe(405);
    expect(response.body).toEqual({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method GET not allowed for /api/bootstrap',
        details: null
      }
    });
  });
});
