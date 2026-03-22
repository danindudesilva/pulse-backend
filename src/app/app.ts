import express from 'express';
import { pinoHttp } from 'pino-http';
import { env } from '../config/env.js';
import { errorMiddleware } from '../lib/http/error-middleware.js';
import { notFoundMiddleware } from '../lib/http/not-found-middleware.js';
import type { AppDependencies } from './register-routes.js';
import { registerRoutes } from './register-routes.js';

export function createApp(deps: AppDependencies) {
  const app = express();

  app.use(express.json());
  app.use(
    pinoHttp({
      enabled: env.NODE_ENV !== 'test',
      level: env.LOG_LEVEL
    })
  );

  registerRoutes(app, deps);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
