import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { MethodNotAllowedError } from '../../../lib/errors/app-error.js';
import { asyncHandler } from '../../../lib/http/async-handler.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { bootstrapUserBodySchema } from './bootstrap.schemas.js';
import type {
  BootstrapUserExecutor,
  BootstrapUserInput
} from '../domain/bootstrap-user.types.js';

export function createBootstrapRouter(service: BootstrapUserExecutor) {
  const router = Router();

  router
    .route('/')
    .post(
      asyncHandler(async (req, res) => {
        const parsed = validateBody(bootstrapUserBodySchema, req);
        const clerkUserId = getAuth(req).userId!;
        const body: BootstrapUserInput = {
          clerkUserId,
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
