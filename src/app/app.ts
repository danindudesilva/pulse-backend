import express from 'express';
import { pinoHttp } from 'pino-http';
import { env } from '../config/env.js';
import { healthRouter } from '../routes/health.route.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    pinoHttp({
      level: env.LOG_LEVEL
    })
  );

  app.use('/health', healthRouter);

  return app;
}
