import { FutureIdentity } from '../../../future-identity/domain/future-identity';
import {
  FutureIdentityRepository,
} from '../../../future-identity/application/ports/future-identity.repository';
import { FutureIdentityNotFoundError } from '../errors/future-identity-not-found.error';
import { GoalRepository } from '../ports/goal.repository';
import { ListGoalsByFutureIdentity } from './list-goals-by-future-identity';
import { Goal } from '../../domain/goal';

describe('ListGoalsByFutureIdentity', () => {
  const futureIdentityId = '8b0ce0bb-2a66-4d0b-b457-8d98df479a01';

  function buildFutureIdentity() {
    return FutureIdentity.restore({
      id: futureIdentityId,
      statement: 'Software Architect con dominio practico de Cloud e IA',
      purpose: 'Quiero mantenerme relevante y construir productos propios.',
      createdAt: new Date('2026-07-18T10:00:00.000Z'),
      updatedAt: new Date('2026-07-18T10:00:00.000Z'),
    });
  }

  function createFixture(existingIdentity: FutureIdentity | null = buildFutureIdentity()) {
    const futureIdentityRepository: FutureIdentityRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(existingIdentity),
    };
    const goalRepository: GoalRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findByFutureIdentityId: jest.fn().mockResolvedValue([]),
    };

    return {
      futureIdentityRepository,
      goalRepository,
      useCase: new ListGoalsByFutureIdentity(
        futureIdentityRepository,
        goalRepository,
      ),
    };
  }

  it('verifies that the future identity exists first', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({ futureIdentityId });

    expect(fixture.futureIdentityRepository.findById).toHaveBeenCalledWith(
      futureIdentityId,
    );
  });

  it('returns an error when the future identity does not exist', async () => {
    const fixture = createFixture(null);

    await expect(
      fixture.useCase.execute({ futureIdentityId }),
    ).rejects.toEqual(new FutureIdentityNotFoundError());
  });

  it('returns a collection of goals', async () => {
    const goals = [
      Goal.restore({
        id: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
        futureIdentityId,
        desiredOutcome:
          'Disenar, construir y explicar un producto real con IA aplicada.',
        purpose:
          'Convertir conocimiento teorico en experiencia practica demostrable.',
        createdAt: new Date('2026-07-19T10:00:00.000Z'),
        updatedAt: new Date('2026-07-19T10:00:00.000Z'),
      }),
    ];
    const fixture = createFixture();
    jest
      .spyOn(fixture.goalRepository, 'findByFutureIdentityId')
      .mockResolvedValue(goals);

    await expect(fixture.useCase.execute({ futureIdentityId })).resolves.toEqual(
      goals,
    );
  });

  it('returns an empty collection when there are no goals', async () => {
    const fixture = createFixture();

    await expect(fixture.useCase.execute({ futureIdentityId })).resolves.toEqual(
      [],
    );
  });

  it('delegates the lookup to the goal repository', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({ futureIdentityId });

    expect(
      fixture.goalRepository.findByFutureIdentityId,
    ).toHaveBeenCalledTimes(1);
    expect(
      fixture.goalRepository.findByFutureIdentityId,
    ).toHaveBeenCalledWith(futureIdentityId);
  });
});
