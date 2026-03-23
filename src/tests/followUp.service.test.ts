import { describe, expect, it } from 'vitest';
import { FollowUpService } from '../modules/followUps/application/followUp.service.js';
import { InMemoryFollowUpRepository } from './support/followUps/in-memory-followUp.repository.js';

describe('FollowUpService', () => {
  it('generates default follow-ups for an opportunity', async () => {
    const repository = new InMemoryFollowUpRepository();
    const service = new FollowUpService(repository);

    await service.generateDefaultFollowUps({
      id: 'opp1',
      createdByUserId: 'user1'
    });

    expect(repository.created).toHaveLength(3);
    expect(
      repository.created.every((item) => item.opportunityId === 'opp1')
    ).toBe(true);
    expect(repository.created.every((item) => item.userId === 'user1')).toBe(
      true
    );
    expect(repository.created.every((item) => item.status === 'pending')).toBe(
      true
    );
  });

  it('generates follow-ups in the future', async () => {
    const repository = new InMemoryFollowUpRepository();
    const service = new FollowUpService(repository);

    const before = Date.now();

    await service.generateDefaultFollowUps({
      id: 'opp1',
      createdByUserId: 'user1'
    });

    expect(repository.created).toHaveLength(3);
    expect(
      repository.created.every((item) => item.dueAt.getTime() > before)
    ).toBe(true);
  });

  it('returns only pending follow-ups due now or earlier', async () => {
    const repository = new InMemoryFollowUpRepository();
    const service = new FollowUpService(repository);

    await repository.createMany([
      {
        id: 'f1',
        opportunityId: 'opp1',
        userId: 'user1',
        dueAt: new Date(Date.now() - 1000),
        status: 'pending'
      },
      {
        id: 'f2',
        opportunityId: 'opp2',
        userId: 'user2',
        dueAt: new Date(Date.now() + 60_000),
        status: 'pending'
      },
      {
        id: 'f3',
        opportunityId: 'opp3',
        userId: 'user3',
        dueAt: new Date(Date.now() - 1000),
        status: 'sent'
      },
      {
        id: 'f4',
        opportunityId: 'opp4',
        userId: 'user4',
        dueAt: new Date(Date.now() - 1000),
        status: 'failed'
      }
    ]);

    const due = await service.getDueFollowUps();

    expect(due).toHaveLength(1);
    const [first] = due;
    expect(first?.id).toBe('f1');
  });

  it('marks follow-ups as sent and sets sentAt', async () => {
    const repository = new InMemoryFollowUpRepository();
    const service = new FollowUpService(repository);

    await repository.createMany([
      {
        id: 'f1',
        opportunityId: 'opp1',
        userId: 'user1',
        dueAt: new Date(Date.now() - 1000),
        status: 'pending'
      }
    ]);

    await service.markAsSent(['f1']);

    expect(repository.created).toHaveLength(1);
    const [first] = repository.created;
    expect(first?.status).toBe('sent');
    expect(first?.sentAt).toBeTruthy();
  });

  it('throws when markAsSent is called with no ids', async () => {
    const repository = new InMemoryFollowUpRepository();
    const service = new FollowUpService(repository);

    await expect(service.markAsSent([])).rejects.toThrow(
      'At least one follow-up id is required'
    );
  });
});
