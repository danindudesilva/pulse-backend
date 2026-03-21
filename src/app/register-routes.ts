import type { Express } from 'express';
import { healthRouter } from '../routes/health.route.js';

export function registerRoutes(app: Express) {
  app.use('/health', healthRouter);
}
