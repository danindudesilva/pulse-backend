import type { Express } from 'express';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import { createBootstrapRouter } from '../modules/identity/api/bootstrap.route.js';
import { PrismaIdentityRepository } from '../modules/identity/infrastructure/prisma-identity.repository.js';
import { prisma } from '../lib/db/prisma.js';
import { healthRouter } from '../routes/health.route.js';

export function registerRoutes(app: Express) {
  const identityRepository = new PrismaIdentityRepository(prisma);
  const bootstrapUserService = new BootstrapUserService(identityRepository);

  app.use('/health', healthRouter);
  app.use('/api/auth/bootstrap', createBootstrapRouter(bootstrapUserService));
}
