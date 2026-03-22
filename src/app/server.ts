import { env } from '../config/env.js';
import { prisma } from '../lib/db/prisma.js';
import { createApp } from './app.js';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import { PrismaIdentityRepository } from '../modules/identity/infrastructure/prisma-identity.repository.js';
import { CreateOpportunityService } from '../modules/opportunities/application/create-opportunity.service.js';
import { PrismaOpportunityRepository } from '../modules/opportunities/infrastructure/prisma-opportunity.repository.js';

const identityRepository = new PrismaIdentityRepository(prisma);
const bootstrapUserService = new BootstrapUserService(identityRepository);

const opportunityRepository = new PrismaOpportunityRepository(prisma);
const createOpportunityService = new CreateOpportunityService(
  opportunityRepository
);

const app = createApp({
  bootstrapUserService,
  createOpportunityService
});

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
