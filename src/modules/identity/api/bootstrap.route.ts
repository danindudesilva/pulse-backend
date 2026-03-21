import { Router } from 'express';
import { MethodNotAllowedError } from '../../../lib/errors/app-error.js';
import { asyncHandler } from '../../../lib/http/async-handler.js';
import { validateBody } from '../../../lib/validation/validate.js';
import type { BootstrapUserService } from '../application/bootstrap-user.service.js';
import { bootstrapUserBodySchema } from './bootstrap.schemas.js';

export function createBootstrapRouter(service: BootstrapUserService) {
  const router = Router();

  router
    .route('/')
    .post(
      asyncHandler(async (req, res) => {
        const body = validateBody(bootstrapUserBodySchema, req);
        const result = await service.execute(body);

        res.status(200).json(result);
      })
    )
    .all((req, _res, next) => {
      next(
        new MethodNotAllowedError(
          `Method ${req.method} not allowed for ${req.baseUrl || '/api/bootstrap'}`
        )
      );
    });

  return router;
}
