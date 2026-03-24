import { env } from '../config/env.js';
import { prisma } from '../lib/db/prisma.js';
import { createApp } from './app.js';
import { BootstrapUserService } from '../modules/identity/application/bootstrap-user.service.js';
import { PrismaIdentityRepository } from '../modules/identity/infrastructure/prisma-identity.repository.js';
import { CreateOpportunityService } from '../modules/opportunities/application/create-opportunity.service.js';
import { GetOpportunityService } from '../modules/opportunities/application/get-opportunity.service.js';
import { ListOpportunitiesService } from '../modules/opportunities/application/list-opportunities.service.js';
import { UpdateOpportunityStatusService } from '../modules/opportunities/application/update-opportunity-status.service.js';
import { PrismaOpportunityRepository } from '../modules/opportunities/infrastructure/prisma-opportunity.repository.js';
import { ResolveAuthContextService } from '../modules/auth/application/resolve-auth-context.service.js';
import { PrismaLocalAuthRepository } from '../modules/auth/infrastructure/prisma-local-auth.repository.js';

const identityRepository = new PrismaIdentityRepository(prisma);
const bootstrapUserService = new BootstrapUserService(identityRepository);

const opportunityRepository = new PrismaOpportunityRepository(prisma);
const createOpportunityService = new CreateOpportunityService(
  opportunityRepository
);
const listOpportunitiesService = new ListOpportunitiesService(
  opportunityRepository
);
const getOpportunityService = new GetOpportunityService(opportunityRepository);
const updateOpportunityStatusService = new UpdateOpportunityStatusService(
  opportunityRepository
);

const localAuthRepository = new PrismaLocalAuthRepository(prisma);
const resolveAuthContextService = new ResolveAuthContextService(
  localAuthRepository
);

const app = createApp({
  bootstrapUserService,
  createOpportunityService,
  listOpportunitiesService,
  getOpportunityService,
  updateOpportunityStatusService,
  resolveAuthContextService
});

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
