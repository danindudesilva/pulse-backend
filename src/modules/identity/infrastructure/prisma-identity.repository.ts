import { Prisma, type PrismaClient } from '../../../generated/prisma/client.js';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../domain/bootstrap-user.types.js';
import type { IdentityRepository } from './identity.repository.js';
import { buildDefaultWorkspaceName } from '../domain/build-default-workspace-name.js';
import { WORKSPACE_OWNER_ROLE } from '../domain/identity.constants.js';
import { ConflictError } from '../../../lib/errors/app-error.js';
import { extractUniqueConstraintFields } from './extract-unique-constraint-fields.js';

export class PrismaIdentityRepository implements IdentityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async bootstrapUser(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: {
            clerkUserId: input.clerkUserId
          },
          update: {
            email: input.email,
            name: input.name ?? null
          },
          create: {
            clerkUserId: input.clerkUserId,
            email: input.email,
            name: input.name ?? null
          }
        });

        const existingMembership = await tx.workspaceMember.findFirst({
          where: {
            userId: user.id
          },
          include: {
            workspace: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (existingMembership) {
          return {
            user: {
              id: user.id,
              clerkUserId: user.clerkUserId,
              email: user.email,
              name: user.name
            },
            workspace: {
              id: existingMembership.workspace.id,
              name: existingMembership.workspace.name
            },
            membership: {
              role: existingMembership.role
            }
          };
        }

        const workspace = await tx.workspace.create({
          data: {
            name: buildDefaultWorkspaceName(user.name, user.email)
          }
        });

        const membership = await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: user.id,
            role: WORKSPACE_OWNER_ROLE
          }
        });

        return {
          user: {
            id: user.id,
            clerkUserId: user.clerkUserId,
            email: user.email,
            name: user.name
          },
          workspace: {
            id: workspace.id,
            name: workspace.name
          },
          membership: {
            role: membership.role
          }
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const fields = extractUniqueConstraintFields(error);

        if (fields.includes('email')) {
          throw new ConflictError('A user with this email already exists');
        }

        throw new ConflictError('A unique constraint was violated');
      }

      throw error;
    }
  }
}
