import { describe, expect, it } from 'vitest';
import { GetOpportunityService } from '../modules/opportunities/application/get-opportunity.service.js';
import { OpportunityNotFoundError } from '../modules/opportunities/domain/opportunity.errors.js';
import { InMemoryOpportunityRepository } from './support/opportunities/test-opportunity-repositories.js';

describe('GetOpportunityService', () => {
  it('returns an opportunity in the requested workspace', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new GetOpportunityService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal 1',
      status: 'draft'
    });

    const result = await service.execute({
      workspaceId: 'ws_1',
      opportunityId: created.id
    });

    expect(result.id).toBe(created.id);
    expect(result.title).toBe('Proposal 1');
  });

  it('throws when the opportunity does not exist in the requested workspace', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new GetOpportunityService(repository);

    const created = await repository.create({
      workspaceId: 'ws_1',
      createdByUserId: 'user_1',
      title: 'Proposal 1',
      status: 'draft'
    });

    await expect(
      service.execute({
        workspaceId: 'ws_2',
        opportunityId: created.id
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });

  it('throws when the opportunity id does not exist', async () => {
    const repository = new InMemoryOpportunityRepository();
    const service = new GetOpportunityService(repository);

    await expect(
      service.execute({
        workspaceId: 'ws_1',
        opportunityId: 'missing_opp'
      })
    ).rejects.toBeInstanceOf(OpportunityNotFoundError);
  });
});
