import express from 'express';
import { pinoHttp } from 'pino-http';
import { clerkMiddleware } from '@clerk/express';
import { env } from '../config/env.js';
import { errorMiddleware } from '../lib/http/error-middleware.js';
import { notFoundMiddleware } from '../lib/http/not-found-middleware.js';
import type { AppDependencies } from './register-routes.js';
import { registerRoutes } from './register-routes.js';

export function createApp(deps: AppDependencies) {
  const app = express();

  app.use(express.json());

  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        level: env.LOG_LEVEL
      })
    );
  }

  if (env.NODE_ENV !== 'test') {
    app.use(clerkMiddleware());
  }

  registerRoutes(app, deps);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
