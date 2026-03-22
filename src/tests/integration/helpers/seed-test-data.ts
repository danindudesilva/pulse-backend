import { prismaTestClient } from './prisma-test-client.js';

export async function seedUser(params: {
  id?: string;
  clerkUserId: string;
  email: string;
  name?: string | null;
}) {
  return prismaTestClient.user.create({
    data: {
      ...(params.id ? { id: params.id } : {}),
      clerkUserId: params.clerkUserId,
      email: params.email,
      name: params.name ?? null
    }
  });
}

export async function seedWorkspace(params: { id?: string; name: string }) {
  return prismaTestClient.workspace.create({
    data: {
      ...(params.id ? { id: params.id } : {}),
      name: params.name
    }
  });
}

export async function seedWorkspaceMember(params: {
  workspaceId: string;
  userId: string;
  role?: 'owner' | 'member';
}) {
  return prismaTestClient.workspaceMember.create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      role: params.role ?? 'owner'
    }
  });
}
