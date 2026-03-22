import type { PrismaClient } from '../../../generated/prisma/client.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from './opportunity.repository.js';

export class PrismaOpportunityRepository implements OpportunityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    const opportunity = await this.prisma.opportunity.create({
      data: {
        workspaceId: input.workspaceId,
        createdByUserId: input.createdByUserId,
        title: input.title,
        companyName: input.companyName ?? null,
        contactName: input.contactName ?? null,
        contactEmail: input.contactEmail ?? null,
        valueAmount: input.valueAmount ?? null,
        currency: input.currency ?? null,
        notes: input.notes ?? null,
        status: input.status,
        quoteSentAt: input.quoteSentAt ?? null
      }
    });

    return {
      id: opportunity.id,
      workspaceId: opportunity.workspaceId,
      createdByUserId: opportunity.createdByUserId,
      title: opportunity.title,
      companyName: opportunity.companyName,
      contactName: opportunity.contactName,
      contactEmail: opportunity.contactEmail,
      valueAmount: opportunity.valueAmount?.toString() ?? null,
      currency: opportunity.currency,
      notes: opportunity.notes,
      status: opportunity.status,
      quoteSentAt: opportunity.quoteSentAt,
      createdAt: opportunity.createdAt,
      updatedAt: opportunity.updatedAt
    };
  }
}
