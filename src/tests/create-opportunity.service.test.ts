import { describe, expect, it } from 'vitest';
import { CreateOpportunityService } from '../modules/opportunities/application/create-opportunity.service.js';
import {
  InMemoryOpportunityRepository,
  SpyOpportunityRepository
} from './support/opportunities/test-opportunity-repositories.js';
import {
  InvalidInitialOpportunityStatusError,
  QuoteSentAtInFutureError,
  QuoteSentAtOnlyAllowedForSentStatusError,
  QuoteSentAtRequiredError
} from '../modules/opportunities/domain/opportunity.errors.js';
import type { CreateOpportunityInput } from '../modules/opportunities/domain/opportunity.types.js';

describe('CreateOpportunityService', () => {
  it('creates a draft opportunity', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });

    expect(result.status).toBe('draft');
    expect(repository.createCallCount).toBe(1);
    expect(repository.lastInput).toMatchObject({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'draft'
    });
  });

  it('creates a sent opportunity when quoteSentAt is provided', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);
    const quoteSentAt = new Date('2026-03-22T10:00:00.000Z');

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      status: 'sent',
      quoteSentAt
    });

    expect(result.status).toBe('sent');
    expect(result.quoteSentAt).toEqual(quoteSentAt);
    expect(repository.createCallCount).toBe(1);
  });

  it('does not call the repository when initial status is not createable', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Proposal',
        status: 'won'
      } as CreateOpportunityInput)
    ).rejects.toBeInstanceOf(InvalidInitialOpportunityStatusError);

    expect(repository.createCallCount).toBe(0);
  });

  it('does not call the repository when initial status is not createable', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Proposal',
        status: 'won'
      } as CreateOpportunityInput)
    ).rejects.toBeInstanceOf(InvalidInitialOpportunityStatusError);

    expect(repository.createCallCount).toBe(0);
  });

  it('requires quoteSentAt when creating a sent opportunity', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Sent without timestamp',
        status: 'sent'
      })
    ).rejects.toThrow('quoteSentAt is required when status is sent');
  });

  it('does not call the repository when quoteSentAt is in the future', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Proposal',
        status: 'sent',
        quoteSentAt: new Date(Date.now() + 60_000)
      })
    ).rejects.toBeInstanceOf(QuoteSentAtInFutureError);

    expect(repository.createCallCount).toBe(0);
  });

  it('does not call the repository when status is sent without quoteSentAt', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Proposal',
        status: 'sent'
      })
    ).rejects.toBeInstanceOf(QuoteSentAtRequiredError);

    expect(repository.createCallCount).toBe(0);
  });

  it('rejects quoteSentAt when status is not sent', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Proposal',
        status: 'draft',
        quoteSentAt: new Date(Date.now() + 60_000)
      })
    ).rejects.toBeInstanceOf(QuoteSentAtOnlyAllowedForSentStatusError);

    expect(repository.createCallCount).toBe(0);
  });

  it('passes optional fields through unchanged when provided', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal',
      companyName: 'Black Pearl Ltd',
      contactName: 'Jack Sparrow',
      contactEmail: 'jack@blackpearl.com',
      valueAmount: '2500.00',
      currency: 'GBP',
      notes: 'Sent after discovery call',
      status: 'draft'
    });

    expect(repository.lastInput).toMatchObject({
      companyName: 'Black Pearl Ltd',
      contactName: 'Jack Sparrow',
      contactEmail: 'jack@blackpearl.com',
      valueAmount: '2500.00',
      currency: 'GBP',
      notes: 'Sent after discovery call',
      status: 'draft'
    });
  });
});
