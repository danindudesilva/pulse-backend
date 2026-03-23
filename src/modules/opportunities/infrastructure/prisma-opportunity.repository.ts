import { Prisma } from '../../../generated/prisma/client.js';
import type { PrismaClient } from '../../../generated/prisma/client.js';
import { ConflictError } from '../../../lib/errors/app-error.js';
import { extractForeignKeyConstraintName } from './extract-foreign-key-constraint.js';
import type {
  CreateOpportunityInput,
  OpportunitySummary
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from './opportunity.repository.js';

export class PrismaOpportunityRepository implements OpportunityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    // Membership integrity check: Validate that user is member of workspace
    // MVP Note: Composite FK not enforced at DB yet.
    // Only app-level check exists, so this service prevents invalid inserts.
    // Integration tests cover this behavior.
    // TODO (post-MVP): Add a raw SQL composite FK for full DB-level enforcement.
    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId: input.createdByUserId,
        workspaceId: input.workspaceId
      }
    });

    if (!membership) {
      throw new ConflictError(
        'User is not a member of the specified workspace'
      );
    }

    try {
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        const constraint = extractForeignKeyConstraintName(error);

        if (constraint?.includes('workspaceId')) {
          throw new ConflictError('Referenced workspace does not exist');
        }

        if (constraint?.includes('createdByUserId')) {
          throw new ConflictError('Referenced user does not exist');
        }

        throw new ConflictError('Referenced workspace or user does not exist');
      }

      throw error;
    }
  }
}
