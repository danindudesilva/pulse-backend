import { describe, expect, it } from 'vitest';
import { UpdateOpportunityStatusService } from '../modules/opportunities/application/update-opportunity-status.service.js';
import {
  InvalidOpportunityStatusTransitionError,
  OpportunityNotFoundError,
  QuoteSentAtInFutureError,
  QuoteSentAtRequiredError
} from '../modules/opportunities/domain/opportunity.errors.js';
import { InMemoryOpportunityRepository } from './support/opportunities/test-opportunity-repositories.js';

describe('UpdateOpportunityStatusService', () => {
  it('updates a valid status transition', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-22T10:00:00.000Z')
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: created.id,
      status: 'replied'
    });

    expect(result.status).toBe('replied');
  });

  it('requires quoteSentAt when transitioning to sent', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: created.id,
        status: 'sent'
      })
    ).rejects.toBeInstanceOf(QuoteSentAtRequiredError);
  });

  it('rejects sent status when quoteSentAt is in the future', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: created.id,
        status: 'sent',
        quoteSentAt: new Date(Date.now() + 60_000)
      })
    ).rejects.toBeInstanceOf(QuoteSentAtInFutureError);
  });

  it('rejects invalid status transitions', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: created.id,
        status: 'won'
      })
    ).rejects.toBeInstanceOf(InvalidOpportunityStatusTransitionError);
  });

  it('throws when the opportunity is not found', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: 'missing_opp',
        status: 'won'
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });

  it('throws when the opportunity exists in another workspace', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'sent',
      quoteSentAt: new Date('2026-03-22T10:00:00.000Z')
    });

    await expect(
      service.execute({
        workspaceId: 'ws_2',
        opportunityId: created.id,
        status: 'replied'
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });

  it('sets quoteSentAt when transitioning to sent from paused', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityStatusService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'paused'
    });

    const quoteSentAt = new Date('2026-03-24T10:00:00.000Z');

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: created.id,
      status: 'sent',
      quoteSentAt
    });

    expect(result.status).toBe('sent');
    expect(result.quoteSentAt).toEqual(quoteSentAt);
  });
});
