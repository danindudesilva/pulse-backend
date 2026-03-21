import express from 'express';
import { errorMiddleware } from '../../../lib/http/error-middleware.js';
import { createBootstrapRouter } from '../../../modules/identity/api/bootstrap.route.js';
import type { BootstrapUserExecutor } from '../../../modules/identity/domain/bootstrap-user.types.js';
import { StubBootstrapUserService } from './stub-bootstrap-user-service.js';

export function createBootstrapTestApp(
  service: BootstrapUserExecutor = new StubBootstrapUserService()
) {
  const app = express();

  app.use(express.json());
  app.use('/api/auth/bootstrap', createBootstrapRouter(service));
  app.use(errorMiddleware);

  return app;
}
