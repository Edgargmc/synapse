import { Clock } from '../../../common/application/ports/clock';
import { IdGenerator } from '../../../common/application/ports/id-generator';
import { Goal } from '../../../goal/domain/goal';
import { GoalRepository } from '../../../goal/application/ports/goal.repository';
import { AttentionNode } from '../../domain/attention-node';
import { AttentionNodeValidationError } from '../../domain/attention-node.errors';
import { GoalNotFoundError } from '../errors/goal-not-found.error';
import { AttentionNodeRepository } from '../ports/attention-node.repository';
import { CreateAndAttachAttentionNode } from './create-and-attach-attention-node';

describe('CreateAndAttachAttentionNode', () => {
  const goalId = 'b77e74bf-cd72-47de-a344-1524aa7d223e';
  const generatedId = 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318';
  const now = new Date('2026-07-20T12:00:00.000Z');

  function buildGoal() {
    return Goal.restore({
      id: goalId,
      futureIdentityId: '8b0ce0bb-2a66-4d0b-b457-8d98df479a01',
      desiredOutcome:
        'Disenar y construir un producto real con IA aplicada en un contexto de negocio.',
      purpose:
        'Convertir conocimiento tecnico en experiencia demostrable frente a producto.',
      createdAt: new Date('2026-07-19T10:00:00.000Z'),
      updatedAt: new Date('2026-07-19T10:00:00.000Z'),
    });
  }

  function createFixture(existingGoal: Goal | null = buildGoal()) {
    const goalRepository: GoalRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(existingGoal),
      findByFutureIdentityId: jest.fn().mockResolvedValue([]),
    };
    const attentionNodeRepository: AttentionNodeRepository = {
      createAndAttachToGoal: jest.fn().mockResolvedValue(undefined),
      findByGoalId: jest.fn().mockResolvedValue([]),
    };
    const idGenerator: IdGenerator = {
      generate: jest.fn().mockReturnValue(generatedId),
    };
    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    return {
      goalRepository,
      attentionNodeRepository,
      idGenerator,
      clock,
      useCase: new CreateAndAttachAttentionNode(
        goalRepository,
        attentionNodeRepository,
        idGenerator,
        clock,
      ),
    };
  }

  it('verifies the goal first', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({
      goalId,
      name: 'Arquitectura de software',
      description: 'Decisiones estructurales en sistemas reales.',
    });

    expect(fixture.goalRepository.findById).toHaveBeenCalledWith(goalId);
  });

  it('returns GoalNotFoundError when the goal does not exist', async () => {
    const fixture = createFixture(null);

    await expect(
      fixture.useCase.execute({
        goalId,
        name: 'Arquitectura de software',
        description: 'Decisiones estructurales en sistemas reales.',
      }),
    ).rejects.toEqual(new GoalNotFoundError());
  });

  it('does not generate, consult the clock or persist when the goal does not exist', async () => {
    const fixture = createFixture(null);

    await expect(
      fixture.useCase.execute({
        goalId,
        name: 'Arquitectura de software',
        description: 'Decisiones estructurales en sistemas reales.',
      }),
    ).rejects.toEqual(new GoalNotFoundError());

    expect(fixture.idGenerator.generate).not.toHaveBeenCalled();
    expect(fixture.clock.now).not.toHaveBeenCalled();
    expect(
      fixture.attentionNodeRepository.createAndAttachToGoal,
    ).not.toHaveBeenCalled();
  });

  it('uses the controlled uuid', async () => {
    const fixture = createFixture();

    const node = await fixture.useCase.execute({
      goalId,
      name: 'Arquitectura de software',
      description: 'Decisiones estructurales en sistemas reales.',
    });

    expect(fixture.idGenerator.generate).toHaveBeenCalledTimes(1);
    expect(node.id).toBe(generatedId);
  });

  it('uses the controlled clock', async () => {
    const fixture = createFixture();

    const node = await fixture.useCase.execute({
      goalId,
      name: 'Arquitectura de software',
      description: 'Decisiones estructurales en sistemas reales.',
    });

    expect(fixture.clock.now).toHaveBeenCalledTimes(1);
    expect(node.createdAt.toISOString()).toBe(now.toISOString());
    expect(node.updatedAt.toISOString()).toBe(now.toISOString());
  });

  it('returns the normalized node', async () => {
    const fixture = createFixture();

    const node = await fixture.useCase.execute({
      goalId,
      name: '  Arquitectura de software  ',
      description: '  Decisiones estructurales en sistemas reales.  ',
    });

    expect(node).toBeInstanceOf(AttentionNode);
    expect(node.name).toBe('Arquitectura de software');
    expect(node.description).toBe('Decisiones estructurales en sistemas reales.');
  });

  it('invokes createAndAttachToGoal exactly once', async () => {
    const fixture = createFixture();

    const node = await fixture.useCase.execute({
      goalId,
      name: 'Arquitectura de software',
      description: 'Decisiones estructurales en sistemas reales.',
    });

    expect(
      fixture.attentionNodeRepository.createAndAttachToGoal,
    ).toHaveBeenCalledTimes(1);
    expect(
      fixture.attentionNodeRepository.createAndAttachToGoal,
    ).toHaveBeenCalledWith(node, goalId);
  });

  it('does not persist when the domain rejects the input', async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute({
        goalId,
        name: '   ',
        description: 'Decisiones estructurales en sistemas reales.',
      }),
    ).rejects.toEqual(
      new AttentionNodeValidationError(
        'EMPTY_ATTENTION_NODE_NAME',
        'El nombre del area de atencion es obligatorio.',
        'name',
      ),
    );

    expect(
      fixture.attentionNodeRepository.createAndAttachToGoal,
    ).not.toHaveBeenCalled();
  });
});
