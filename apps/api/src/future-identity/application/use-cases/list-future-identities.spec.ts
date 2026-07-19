import { FutureIdentity } from '../../domain/future-identity';
import { FutureIdentityRepository } from '../ports/future-identity.repository';
import { ListFutureIdentities } from './list-future-identities';

describe('ListFutureIdentities', () => {
  it('returns a collection from the repository', async () => {
    const identities = [
      FutureIdentity.restore({
        id: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
        statement: 'Arquitecto de software',
        purpose: 'Quiero construir productos propios.',
        createdAt: new Date('2026-07-19T10:00:00.000Z'),
        updatedAt: new Date('2026-07-19T10:00:00.000Z'),
      }),
    ];
    const repository: FutureIdentityRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue(identities),
      findById: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ListFutureIdentities(repository);

    await expect(useCase.execute()).resolves.toEqual(identities);
  });

  it('returns an empty list when there are no identities', async () => {
    const repository: FutureIdentityRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ListFutureIdentities(repository);

    await expect(useCase.execute()).resolves.toEqual([]);
  });

  it('delegates to the repository', async () => {
    const repository: FutureIdentityRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ListFutureIdentities(repository);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
});
