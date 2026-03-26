import express from 'express';
import { errorMiddleware } from '../../../lib/http/error-middleware.js';
import { createDashboardRouter } from '../../../modules/dashboard/api/dashboard.route.js';
import type { GetDashboardSummaryExecutor } from '../../../modules/dashboard/api/dashboard.route.js';
import type { AuthContext } from '../../../modules/auth/domain/auth-context.types.js';
import { StubGetDashboardSummaryService } from './stub-get-dashboard-summary.service.js';

export function createDashboardTestApp(
  service: GetDashboardSummaryExecutor = new StubGetDashboardSummaryService(),
  authContext?: AuthContext
) {
  const app = express();

  if (authContext) {
    app.use((req, _res, next) => {
      req.authContext = authContext;
      next();
    });
  }

  app.use('/api/dashboard', createDashboardRouter(service));
  app.use(errorMiddleware);

  return app;
}
