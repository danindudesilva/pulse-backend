import { describe, expect, it } from 'vitest';
import { UpdateOpportunityService } from '../modules/opportunities/application/update-opportunity.service.js';
import { OpportunityNotFoundError } from '../modules/opportunities/domain/opportunity.errors.js';
import { InMemoryOpportunityRepository } from './support/opportunities/test-opportunity-repositories.js';

describe('UpdateOpportunityService', () => {
  it('updates editable fields', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Original Title',
      companyName: 'Old Company',
      contactName: 'Old Name',
      contactEmail: 'old@example.com',
      valueAmount: '100.00',
      currency: 'GBP',
      notes: 'Old notes',
      status: 'draft'
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: created.id,
      title: 'Updated Title',
      companyName: 'New Company',
      notes: 'New notes'
    });

    expect(result.title).toBe('Updated Title');
    expect(result.companyName).toBe('New Company');
    expect(result.notes).toBe('New notes');
    expect(result.contactName).toBe('Old Name');
  });

  it('allows null to clear optional fields', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Original Title',
      companyName: 'Old Company',
      contactName: 'Old Name',
      contactEmail: 'old@example.com',
      valueAmount: '100.00',
      currency: 'GBP',
      notes: 'Old notes',
      status: 'draft'
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: created.id,
      companyName: null,
      contactName: null,
      contactEmail: null,
      valueAmount: null,
      currency: null,
      notes: null
    });

    expect(result.companyName).toBeNull();
    expect(result.contactName).toBeNull();
    expect(result.contactEmail).toBeNull();
    expect(result.valueAmount).toBeNull();
    expect(result.currency).toBeNull();
    expect(result.notes).toBeNull();
  });

  it('leaves unspecified fields unchanged', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Original Title',
      companyName: 'Old Company',
      contactName: 'Old Name',
      contactEmail: 'old@example.com',
      valueAmount: '100.00',
      currency: 'GBP',
      notes: 'Old notes',
      status: 'draft'
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: created.id,
      title: 'Updated Title'
    });

    expect(result.title).toBe('Updated Title');
    expect(result.companyName).toBe('Old Company');
    expect(result.contactName).toBe('Old Name');
    expect(result.contactEmail).toBe('old@example.com');
    expect(result.valueAmount).toBe('100.00');
    expect(result.currency).toBe('GBP');
    expect(result.notes).toBe('Old notes');
  });

  it('throws when the opportunity does not exist in the workspace', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: 'missing_opp',
        title: 'Updated Title'
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });

  it('throws when the opportunity exists in another workspace', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new UpdateOpportunityService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Original Title',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: 'ws_2',
        opportunityId: created.id,
        title: 'Updated Title'
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });
});
