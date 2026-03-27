import { Prisma } from '../../../generated/prisma/client.js';
import type {
  PrismaClient,
  Opportunity,
  FollowUp
} from '../../../generated/prisma/client.js';
import { ConflictError } from '../../../lib/errors/app-error.js';
import { extractForeignKeyConstraintName } from './extract-foreign-key-constraint.js';
import type {
  CreateOpportunityInput,
  GetOpportunityInput,
  ListOpportunitiesInput,
  OpportunitySummary,
  PaginatedOpportunities,
  UpdateOpportunityInput,
  UpdateOpportunityStatusInput
} from '../domain/opportunity.types.js';
import type { OpportunityRepository } from './opportunity.repository.js';

type PrismaOpportunityRepositoryClient = Pick<
  PrismaClient,
  'opportunity' | 'workspaceMember' | 'workspace' | 'user'
>;

type OpportunityWithPendingFollowUps = Opportunity & {
  followUps: Pick<FollowUp, 'dueAt'>[];
};

function buildOpportunityListWhere(
  input: ListOpportunitiesInput
): Prisma.OpportunityWhereInput {
  const now = new Date();

  return {
    workspaceId: input.workspaceId,
    ...(input.status ? { status: input.status } : {}),
    ...(input.view === 'due'
      ? {
          followUps: {
            some: {
              status: 'pending',
              dueAt: { lte: now }
            }
          }
        }
      : {}),
    ...(input.view === 'upcoming'
      ? {
          AND: [
            {
              followUps: {
                none: {
                  status: 'pending',
                  dueAt: { lte: now }
                }
              }
            },
            {
              followUps: {
                some: {
                  status: 'pending',
                  dueAt: { gt: now }
                }
              }
            }
          ]
        }
      : {})
  };
}

function toOpportunitySummary(
  opportunity: OpportunityWithPendingFollowUps
): OpportunitySummary {
  const sortedFollowUps = [...opportunity.followUps].sort(
    (a, b) => a.dueAt.getTime() - b.dueAt.getTime()
  );

  return {
    id: opportunity.id,
    workspaceId: opportunity.workspaceId,
    createdByUserId: opportunity.createdByUserId,
    title: opportunity.title,
    companyName: opportunity.companyName,
    contactName: opportunity.contactName,
    contactEmail: opportunity.contactEmail,
    valueAmount: opportunity.valueAmount?.toFixed(2) ?? null,
    currency: opportunity.currency,
    notes: opportunity.notes,
    status: opportunity.status,
    quoteSentAt: opportunity.quoteSentAt,
    nextFollowUpAt: sortedFollowUps[0]?.dueAt ?? null,
    createdAt: opportunity.createdAt,
    updatedAt: opportunity.updatedAt
  };
}

export class PrismaOpportunityRepository implements OpportunityRepository {
  constructor(private readonly prisma: PrismaOpportunityRepositoryClient) {}

  async create(input: CreateOpportunityInput): Promise<OpportunitySummary> {
    // Membership integrity check: Validate that user is member of workspace
    // MVP Note: Composite FK not enforced at DB yet.
    // Only app-level check exists, so this service prevents invalid inserts.
    // Integration tests cover this behavior.
    // TODO (post-MVP): Add a raw SQL composite FK for full DB-level enforcement.
    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: input.workspaceId,
        userId: input.createdByUserId
      }
    });

    if (!membership) {
      const workspaceExists = await this.prisma.workspace.findUnique({
        where: { id: input.workspaceId }
      });

      if (!workspaceExists) {
        throw new ConflictError('Referenced workspace does not exist');
      }

      const userExists = await this.prisma.user.findUnique({
        where: { id: input.createdByUserId }
      });

      if (!userExists) {
        throw new ConflictError('Referenced user does not exist');
      }

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
          valueAmount:
            input.valueAmount !== undefined && input.valueAmount !== null
              ? Number(input.valueAmount).toFixed(2)
              : null,
          currency: input.currency ?? null,
          notes: input.notes ?? null,
          status: input.status,
          quoteSentAt: input.quoteSentAt ?? null
        },
        include: {
          followUps: {
            where: { status: 'pending' },
            select: { dueAt: true }
          }
        }
      });

      return toOpportunitySummary(opportunity);
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

  async listByWorkspace(
    input: ListOpportunitiesInput
  ): Promise<PaginatedOpportunities> {
    const where = buildOpportunityListWhere(input);
    const skip = (input.page - 1) * input.pageSize;

    const [totalItems, opportunities] = await Promise.all([
      this.prisma.opportunity.count({ where }),
      this.prisma.opportunity.findMany({
        where,
        include: {
          followUps: {
            where: { status: 'pending' },
            select: { dueAt: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: input.pageSize
      })
    ]);

    return {
      items: opportunities.map(toOpportunitySummary),
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        totalItems,
        totalPages:
          totalItems === 0 ? 0 : Math.ceil(totalItems / input.pageSize)
      }
    };
  }

  async findByIdInWorkspace(
    input: GetOpportunityInput
  ): Promise<OpportunitySummary | null> {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: {
        id: input.opportunityId,
        workspaceId: input.workspaceId
      },
      include: {
        followUps: {
          where: { status: 'pending' },
          select: { dueAt: true }
        }
      }
    });

    return opportunity ? toOpportunitySummary(opportunity) : null;
  }

  async updateStatus(
    input: UpdateOpportunityStatusInput
  ): Promise<OpportunitySummary | null> {
    const existing = await this.prisma.opportunity.findFirst({
      where: {
        id: input.opportunityId,
        workspaceId: input.workspaceId
      }
    });

    if (!existing) {
      return null;
    }

    const updated = await this.prisma.opportunity.update({
      where: {
        id: existing.id
      },
      data: {
        status: input.status,
        ...(input.status === 'sent'
          ? { quoteSentAt: input.quoteSentAt ?? null }
          : {})
      },
      include: {
        followUps: {
          where: { status: 'pending' },
          select: { dueAt: true }
        }
      }
    });

    return toOpportunitySummary(updated);
  }

  async updateInWorkspace(
    input: UpdateOpportunityInput
  ): Promise<OpportunitySummary | null> {
    const existing = await this.prisma.opportunity.findFirst({
      where: {
        id: input.opportunityId,
        workspaceId: input.workspaceId
      }
    });

    if (!existing) {
      return null;
    }

    const updated = await this.prisma.opportunity.update({
      where: {
        id: existing.id
      },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.companyName !== undefined
          ? { companyName: input.companyName }
          : {}),
        ...(input.contactName !== undefined
          ? { contactName: input.contactName }
          : {}),
        ...(input.contactEmail !== undefined
          ? { contactEmail: input.contactEmail }
          : {}),
        ...(input.valueAmount !== undefined
          ? { valueAmount: input.valueAmount }
          : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {})
      },
      include: {
        followUps: {
          where: { status: 'pending' },
          select: { dueAt: true }
        }
      }
    });

    return toOpportunitySummary(updated);
  }
}
