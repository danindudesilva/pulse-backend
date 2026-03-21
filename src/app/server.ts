import { createApp } from './app.js';
import { prisma } from '../lib/db/prisma.js';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import { PrismaIdentityRepository } from '../modules/identity/infrastructure/prisma-identity.repository.js';
import { env } from '../config/env.js';

const identityRepository = new PrismaIdentityRepository(prisma);
const bootstrapUserService = new BootstrapUserService(identityRepository);

const app = createApp({
  bootstrapUserService
});

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
