import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '../lib/errors/app-error.js';
import { asyncHandler } from '../lib/http/async-handler.js';
import { errorMiddleware } from '../lib/http/error-middleware.js';

describe('error middleware', () => {
  it('returns structured app errors', async () => {
    const app = express();

    app.get(
      '/app-error',
      asyncHandler(async () => {
        throw new AppError({
          message: 'Boom',
          statusCode: 409,
          code: 'CONFLICT'
        });
      })
    );

    app.use(errorMiddleware);

    const response = await request(app).get('/app-error');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Boom',
        details: null
      }
    });
  });

  it('returns structured zod validation errors', async () => {
    const app = express();
    app.use(express.json());

    app.post(
      '/validate',
      asyncHandler(async (req, res) => {
        z.object({
          name: z.string().min(1)
        }).parse(req.body);

        res.status(200).json({ ok: true });
      })
    );

    app.use(errorMiddleware);

    const response = await request(app).post('/validate').send({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
