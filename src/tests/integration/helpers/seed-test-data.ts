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

export async function seedOpportunity(
  prisma: PrismaClient,
  params: {
    id?: string;
    workspaceId: string;
    createdByUserId: string;
    title: string;
    status: 'draft' | 'paused' | 'sent' | 'replied' | 'won' | 'lost';
    companyName?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    valueAmount?: string | null;
    currency?: string | null;
    notes?: string | null;
    quoteSentAt?: Date | null;
  }
) {
  return prisma.opportunity.create({
    data: {
      ...(params.id ? { id: params.id } : {}),
      workspaceId: params.workspaceId,
      createdByUserId: params.createdByUserId,
      title: params.title,
      status: params.status,
      companyName: params.companyName ?? null,
      contactName: params.contactName ?? null,
      contactEmail: params.contactEmail ?? null,
      valueAmount: params.valueAmount ?? null,
      currency: params.currency ?? null,
      notes: params.notes ?? null,
      quoteSentAt: params.quoteSentAt ?? null
    }
  });
}

export async function seedFollowUp(
  prisma: PrismaClient,
  params: {
    id?: string;
    opportunityId: string;
    userId: string;
    dueAt: Date;
    sentAt?: Date | null;
    status?: string;
  }
) {
  return prisma.followUp.create({
    data: {
      ...(params.id ? { id: params.id } : {}),
      opportunityId: params.opportunityId,
      userId: params.userId,
      dueAt: params.dueAt,
      sentAt: params.sentAt ?? null,
      status: params.status ?? 'pending'
    }
  });
}
