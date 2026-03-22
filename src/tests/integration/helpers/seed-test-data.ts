import type { PrismaClient } from '../../../generated/prisma/client.js';

export async function seedUser(
  prisma: PrismaClient,
  params: {
    id?: string;
    clerkUserId: string;
    email: string;
    name?: string | null;
  }
) {
  return prisma.user.create({
    data: {
      ...(params.id ? { id: params.id } : {}),
      clerkUserId: params.clerkUserId,
      email: params.email,
      name: params.name ?? null
    }
  });
}

export async function seedWorkspace(
  prisma: PrismaClient,
  params: {
    id?: string;
    name: string;
  }
) {
  return prisma.workspace.create({
    data: {
      ...(params.id ? { id: params.id } : {}),
      name: params.name
    }
  });
}

export async function seedWorkspaceMember(
  prisma: PrismaClient,
  params: {
    workspaceId: string;
    userId: string;
    role?: 'owner' | 'member';
  }
) {
  return prisma.workspaceMember.create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      role: params.role ?? 'owner'
    }
  });
}
