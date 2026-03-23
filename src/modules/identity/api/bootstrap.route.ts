import { Router } from 'express';
import { getAuth } from '@clerk/express';
import {
  MethodNotAllowedError,
  UnauthorizedError
} from '../../../lib/errors/app-error.js';
import { asyncHandler } from '../../../lib/http/async-handler.js';
import { validateBody } from '../../../lib/validation/validate.js';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../domain/bootstrap-user.types.js';
import { bootstrapUserBodySchema } from './bootstrap.schemas.js';

type BootstrapUserExecutor = {
  execute(input: BootstrapUserInput): Promise<BootstrapUserResult>;
};

export function createBootstrapRouter(service: BootstrapUserExecutor) {
  const router = Router();

  router
    .route('/')
    .post(
      asyncHandler(async (req, res) => {
        const auth = getAuth(req);

        if (!auth.userId) {
          throw new UnauthorizedError('Authentication required');
        }

        const parsed = validateBody(bootstrapUserBodySchema, req);

        const body: BootstrapUserInput = {
          clerkUserId: auth.userId,
          email: parsed.email,
          ...(parsed.name !== undefined ? { name: parsed.name } : {})
        };

        const result = await service.execute(body);

        res.status(200).json(result);
      })
    )
    .all((req, _res, next) => {
      next(
        new MethodNotAllowedError(
          `Method ${req.method} not allowed for ${req.baseUrl || '/api/auth/bootstrap'}`
        )
      );
    });

  return router;
}
