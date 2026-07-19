import { Clock } from '../../../common/application/ports/clock';
import { IdGenerator } from '../../../common/application/ports/id-generator';
import { FutureIdentity } from '../../domain/future-identity';
import { DomainValidationError } from '../../domain/future-identity.errors';
import { FutureIdentityRepository } from '../ports/future-identity.repository';
import { CreateFutureIdentity } from './create-future-identity';

describe('CreateFutureIdentity', () => {
  const generatedId = '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6';
  const now = new Date('2026-07-19T10:00:00.000Z');

  function createFixture() {
    const repository: FutureIdentityRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    const idGenerator: IdGenerator = {
      generate: jest.fn().mockReturnValue(generatedId),
    };
    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    return {
      repository,
      idGenerator,
      clock,
      useCase: new CreateFutureIdentity(repository, idGenerator, clock),
    };
  }

  it('uses the controlled uuid', async () => {
    const fixture = createFixture();

    const identity = await fixture.useCase.execute({
      statement: 'Arquitecto de software',
      purpose: 'Quiero construir productos propios.',
    });

    expect(fixture.idGenerator.generate).toHaveBeenCalledTimes(1);
    expect(identity.id).toBe(generatedId);
  });

  it('uses the controlled clock', async () => {
    const fixture = createFixture();

    const identity = await fixture.useCase.execute({
      statement: 'Arquitecto de software',
      purpose: 'Quiero construir productos propios.',
    });

    expect(fixture.clock.now).toHaveBeenCalledTimes(1);
    expect(identity.createdAt.toISOString()).toBe(now.toISOString());
    expect(identity.updatedAt.toISOString()).toBe(now.toISOString());
  });

  it('persists exactly once', async () => {
    const fixture = createFixture();

    const identity = await fixture.useCase.execute({
      statement: 'Arquitecto de software',
      purpose: 'Quiero construir productos propios.',
    });

    expect(fixture.repository.save).toHaveBeenCalledTimes(1);
    expect(fixture.repository.save).toHaveBeenCalledWith(identity);
  });

  it('returns the created identity', async () => {
    const fixture = createFixture();

    const identity = await fixture.useCase.execute({
      statement: '  Arquitecto de software  ',
      purpose: '  Quiero construir productos propios.  ',
    });

    expect(identity).toBeInstanceOf(FutureIdentity);
    expect(identity.statement).toBe('Arquitecto de software');
    expect(identity.purpose).toBe('Quiero construir productos propios.');
  });

  it('does not persist when the domain rejects the input', async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute({
        statement: '   ',
        purpose: 'Quiero construir productos propios.',
      }),
    ).rejects.toEqual(
      new DomainValidationError(
        'EMPTY_FUTURE_IDENTITY_STATEMENT',
        'La identidad futura es obligatoria.',
        'statement',
      ),
    );

    expect(fixture.repository.save).not.toHaveBeenCalled();
  });
});
