import type { PrismaClient } from '../../../generated/prisma/client.js';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../domain/bootstrap-user.types.js';
import type { IdentityRepository } from './identity.repository.js';
import { buildDefaultWorkspaceName } from '../domain/build-default-workspace-name.js';
import { WORKSPACE_OWNER_ROLE } from '../domain/identity.constants.js';

export class PrismaIdentityRepository implements IdentityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async bootstrapUser(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    return this.prisma.$transaction(async (tx) => {
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

      const workspaceName = buildDefaultWorkspaceName(user.name, user.email);

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName
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
  }
}
