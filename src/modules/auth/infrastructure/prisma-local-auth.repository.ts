import type { PrismaClient } from '../../../generated/prisma/client.js';
import type { AuthContext } from '../domain/auth-context.types.js';
import type { LocalAuthRepository } from './local-auth.repository.js';

export class PrismaLocalAuthRepository implements LocalAuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAuthContextByClerkUserId(
    clerkUserId: string
  ): Promise<AuthContext | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        clerkUserId
      }
    });

    if (!user) {
      return null;
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!membership) {
      return null;
    }

    return {
      clerkUserId,
      userId: user.id,
      workspaceId: membership.workspaceId
    };
  }
}
