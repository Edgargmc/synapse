import { Clock } from '../../../common/application/ports/clock';
import { IdGenerator } from '../../../common/application/ports/id-generator';
import { FutureIdentity } from '../../../future-identity/domain/future-identity';
import {
  FutureIdentityRepository,
} from '../../../future-identity/application/ports/future-identity.repository';
import { Goal } from '../../domain/goal';
import { GoalValidationError } from '../../domain/goal.errors';
import { FutureIdentityNotFoundError } from '../errors/future-identity-not-found.error';
import { GoalRepository } from '../ports/goal.repository';
import { CreateGoal } from './create-goal';

describe('CreateGoal', () => {
  const generatedId = '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6';
  const futureIdentityId = '8b0ce0bb-2a66-4d0b-b457-8d98df479a01';
  const now = new Date('2026-07-19T10:00:00.000Z');

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
    const idGenerator: IdGenerator = {
      generate: jest.fn().mockReturnValue(generatedId),
    };
    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    return {
      futureIdentityRepository,
      goalRepository,
      idGenerator,
      clock,
      useCase: new CreateGoal(
        futureIdentityRepository,
        goalRepository,
        idGenerator,
        clock,
      ),
    };
  }

  it('verifies the future identity first', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({
      futureIdentityId,
      desiredOutcome: 'Disenar, construir y explicar un producto real con IA aplicada.',
      purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
    });

    expect(fixture.futureIdentityRepository.findById).toHaveBeenCalledWith(
      futureIdentityId,
    );
  });

  it('returns FutureIdentityNotFoundError when the identity does not exist', async () => {
    const fixture = createFixture(null);

    await expect(
      fixture.useCase.execute({
        futureIdentityId,
        desiredOutcome: 'Disenar, construir y explicar un producto real con IA aplicada.',
        purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
      }),
    ).rejects.toEqual(new FutureIdentityNotFoundError());
  });

  it('does not generate or persist when the identity does not exist', async () => {
    const fixture = createFixture(null);

    await expect(
      fixture.useCase.execute({
        futureIdentityId,
        desiredOutcome: 'Disenar, construir y explicar un producto real con IA aplicada.',
        purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
      }),
    ).rejects.toEqual(new FutureIdentityNotFoundError());

    expect(fixture.idGenerator.generate).not.toHaveBeenCalled();
    expect(fixture.clock.now).not.toHaveBeenCalled();
    expect(fixture.goalRepository.save).not.toHaveBeenCalled();
  });

  it('uses the controlled uuid', async () => {
    const fixture = createFixture();

    const goal = await fixture.useCase.execute({
      futureIdentityId,
      desiredOutcome: 'Disenar, construir y explicar un producto real con IA aplicada.',
      purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
    });

    expect(fixture.idGenerator.generate).toHaveBeenCalledTimes(1);
    expect(goal.id).toBe(generatedId);
  });

  it('uses the controlled clock', async () => {
    const fixture = createFixture();

    const goal = await fixture.useCase.execute({
      futureIdentityId,
      desiredOutcome: 'Disenar, construir y explicar un producto real con IA aplicada.',
      purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
    });

    expect(fixture.clock.now).toHaveBeenCalledTimes(1);
    expect(goal.createdAt.toISOString()).toBe(now.toISOString());
    expect(goal.updatedAt.toISOString()).toBe(now.toISOString());
  });

  it('persists exactly once', async () => {
    const fixture = createFixture();

    const goal = await fixture.useCase.execute({
      futureIdentityId,
      desiredOutcome: 'Disenar, construir y explicar un producto real con IA aplicada.',
      purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
    });

    expect(fixture.goalRepository.save).toHaveBeenCalledTimes(1);
    expect(fixture.goalRepository.save).toHaveBeenCalledWith(goal);
  });

  it('returns the created goal', async () => {
    const fixture = createFixture();

    const goal = await fixture.useCase.execute({
      futureIdentityId,
      desiredOutcome: '  Disenar, construir y explicar un producto real con IA aplicada.  ',
      purpose: '  Convertir conocimiento teorico en experiencia practica demostrable.  ',
    });

    expect(goal).toBeInstanceOf(Goal);
    expect(goal.desiredOutcome).toBe(
      'Disenar, construir y explicar un producto real con IA aplicada.',
    );
    expect(goal.purpose).toBe(
      'Convertir conocimiento teorico en experiencia practica demostrable.',
    );
  });

  it('does not persist when the domain rejects the input', async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute({
        futureIdentityId,
        desiredOutcome: '   ',
        purpose: 'Convertir conocimiento teorico en experiencia practica demostrable.',
      }),
    ).rejects.toEqual(
      new GoalValidationError(
        'EMPTY_GOAL_DESIRED_OUTCOME',
        'La transformacion concreta es obligatoria.',
        'desiredOutcome',
      ),
    );

    expect(fixture.goalRepository.save).not.toHaveBeenCalled();
  });
});
