import type { PrismaClient } from '../../../generated/prisma/client.js';
import { CreateOpportunityService } from './create-opportunity.service.js';
import { FollowUpService } from '../../followUps/application/followUp.service.js';
import { PrismaOpportunityRepository } from '../infrastructure/prisma-opportunity.repository.js';
import { PrismaFollowUpRepository } from '../../followUps/infrastructure/prisma-followUp.repository.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';

export class CreateOpportunityWithFollowUpsService {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    return this.prisma.$transaction(async (tx) => {
      const opportunityRepository = new PrismaOpportunityRepository(tx);
      const followUpRepository = new PrismaFollowUpRepository(tx);

      const createOpportunityService = new CreateOpportunityService(
        opportunityRepository
      );
      const followUpService = new FollowUpService(followUpRepository);

      const opportunity = await createOpportunityService.execute(input);

      await followUpService.generateDefaultFollowUps({
        id: opportunity.id,
        createdByUserId: opportunity.createdByUserId
      });

      return opportunity;
    });
  }
}
