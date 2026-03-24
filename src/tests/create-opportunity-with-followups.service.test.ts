import { describe, expect, it } from 'vitest';
import { CreateOpportunityWithFollowUpsService } from '../modules/opportunities/application/create-opportunity-with-followups.service.js';

describe('CreateOpportunityWithFollowUpsService', () => {
  it('creates an opportunity and its default follow-ups in one transaction', async () => {
    const createdOpportunities: Array<Record<string, unknown>> = [];
    const createdFollowUps: Array<Record<string, unknown>> = [];

    const tx = {
      workspaceMember: {
        findFirst: async () => ({
          workspaceId: 'ws_1',
          userId: 'user_1'
        })
      },
      workspace: {
        findUnique: async () => ({ id: 'ws_1' })
      },
      user: {
        findUnique: async () => ({ id: 'user_1' })
      },
      opportunity: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          const created = {
            id: 'opp_1',
            workspaceId: data.workspaceId,
            createdByUserId: data.createdByUserId,
            title: data.title,
            companyName: data.companyName ?? null,
            contactName: data.contactName ?? null,
            contactEmail: data.contactEmail ?? null,
            valueAmount: null,
            currency: data.currency ?? null,
            notes: data.notes ?? null,
            status: data.status,
            quoteSentAt: data.quoteSentAt ?? null,
            followUps: [],
            createdAt: new Date('2026-03-24T10:00:00.000Z'),
            updatedAt: new Date('2026-03-24T10:00:00.000Z')
          };

          createdOpportunities.push(created);

          return created;
        }
      },
      followUp: {
        createMany: async ({ data }: { data: Record<string, unknown>[] }) => {
          createdFollowUps.push(...data);
          return { count: data.length };
        }
      }
    };

    type FakeTransactionClient = typeof tx;

    const prisma = {
      $transaction: async <T>(
        fn: (tx: FakeTransactionClient) => Promise<T>
      ): Promise<T> => fn(tx)
    };

    const service = new CreateOpportunityWithFollowUpsService(prisma as never);

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });

    expect(result.id).toBe('opp_1');
    expect(createdOpportunities).toHaveLength(1);
    expect(createdFollowUps).toHaveLength(3);
    expect(
      createdFollowUps.every((item) => item.opportunityId === 'opp_1')
    ).toBe(true);
    expect(createdFollowUps.every((item) => item.userId === 'user_1')).toBe(
      true
    );
  });

  it('rolls back when follow-up creation fails', async () => {
    const createdOpportunities: Array<Record<string, unknown>> = [];

    const tx = {
      workspaceMember: {
        findFirst: async () => ({
          workspaceId: 'ws_1',
          userId: 'user_1'
        })
      },
      workspace: {
        findUnique: async () => ({ id: 'ws_1' })
      },
      user: {
        findUnique: async () => ({ id: 'user_1' })
      },
      opportunity: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          const created = {
            id: 'opp_1',
            workspaceId: data.workspaceId,
            createdByUserId: data.createdByUserId,
            title: data.title,
            companyName: data.companyName ?? null,
            contactName: data.contactName ?? null,
            contactEmail: data.contactEmail ?? null,
            valueAmount: null,
            currency: data.currency ?? null,
            notes: data.notes ?? null,
            status: data.status,
            quoteSentAt: data.quoteSentAt ?? null,
            followUps: [],
            createdAt: new Date('2026-03-24T10:00:00.000Z'),
            updatedAt: new Date('2026-03-24T10:00:00.000Z')
          };

          createdOpportunities.push(created);

          return created;
        }
      },
      followUp: {
        createMany: async () => {
          throw new Error('follow-up insert failed');
        }
      }
    };

    type FakeTransactionClient = typeof tx;

    const prisma = {
      $transaction: async <T>(
        fn: (tx: FakeTransactionClient) => Promise<T>
      ): Promise<T> => fn(tx)
    };

    const service = new CreateOpportunityWithFollowUpsService(prisma as never);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Proposal',
        status: 'draft'
      })
    ).rejects.toThrow('follow-up insert failed');

    expect(createdOpportunities).toHaveLength(1);
  });
});
