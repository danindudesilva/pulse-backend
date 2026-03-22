import type { Express } from 'express';
import { healthRouter } from '../routes/health.route.js';
import type { BootstrapUserExecutor } from '../modules/identity/domain/bootstrap-user.types.js';
import { createBootstrapRouter } from '../modules/identity/api/bootstrap.route.js';

export type AppDependencies = {
  bootstrapUserService: BootstrapUserExecutor;
};

export function registerRoutes(app: Express, deps: AppDependencies) {
  app.use('/health', healthRouter);
  app.use(
    '/api/auth/bootstrap',
    createBootstrapRouter(deps.bootstrapUserService)
  );
}
