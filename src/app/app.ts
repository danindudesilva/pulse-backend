import express from 'express';
import { pinoHttp } from 'pino-http';
import { env } from '../config/env.js';
import { errorMiddleware } from '../lib/http/error-middleware.js';
import { registerRoutes } from './register-routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    pinoHttp({
      level: env.LOG_LEVEL
    })
  );

  registerRoutes(app);

  app.use(errorMiddleware);

  return app;
}
