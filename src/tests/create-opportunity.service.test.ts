import { describe, expect, it } from 'vitest';
import { CreateOpportunityService } from '../modules/opportunities/application/create-opportunity.service.js';
import {
  InMemoryOpportunityRepository,
  SpyOpportunityRepository
} from './support/opportunities/test-opportunity-repositories.js';

describe('CreateOpportunityService', () => {
  it('creates a draft opportunity', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Website redesign proposal',
      status: 'draft'
    });

    expect(result.title).toBe('Website redesign proposal');
    expect(result.status).toBe('draft');
    expect(result.quoteSentAt).toBeNull();
  });

  it('creates a sent opportunity when quoteSentAt is provided', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    const quoteSentAt = new Date('2026-03-22T09:00:00.000Z');

    const result = await service.execute({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Mobile app proposal',
      status: 'sent',
      quoteSentAt
    });

    expect(result.status).toBe('sent');
    expect(result.quoteSentAt).toEqual(quoteSentAt);
  });

  it('rejects non-createable initial statuses', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Invalid status opportunity',
        status: 'won'
      })
    ).rejects.toThrow(
      'Initial opportunity status must be either draft or sent'
    );
  });

  it('does not call the repository when initial status is not createable', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Invalid status opportunity',
        status: 'won'
      })
    ).rejects.toThrow(
      'Initial opportunity status must be either draft or sent'
    );

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

  it('does not call the repository when status is sent without quoteSentAt', async () => {
    const repository = new SpyOpportunityRepository();
    const service = new CreateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        createdByUserId: 'user_1',
        title: 'Sent without timestamp',
        status: 'sent'
      })
    ).rejects.toThrow('quoteSentAt is required when status is sent');

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
