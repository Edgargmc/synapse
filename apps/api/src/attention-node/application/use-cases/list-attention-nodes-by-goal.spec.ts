import { Goal } from '../../../goal/domain/goal';
import { GoalRepository } from '../../../goal/application/ports/goal.repository';
import { AttentionNode } from '../../domain/attention-node';
import { GoalNotFoundError } from '../errors/goal-not-found.error';
import { AttentionNodeRepository } from '../ports/attention-node.repository';
import { ListAttentionNodesByGoal } from './list-attention-nodes-by-goal';

describe('ListAttentionNodesByGoal', () => {
  const goalId = 'b77e74bf-cd72-47de-a344-1524aa7d223e';

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

    return {
      goalRepository,
      attentionNodeRepository,
      useCase: new ListAttentionNodesByGoal(
        goalRepository,
        attentionNodeRepository,
      ),
    };
  }

  it('verifies that the goal exists first', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({ goalId });

    expect(fixture.goalRepository.findById).toHaveBeenCalledWith(goalId);
  });

  it('returns a logical 404 when the goal does not exist', async () => {
    const fixture = createFixture(null);

    await expect(fixture.useCase.execute({ goalId })).rejects.toEqual(
      new GoalNotFoundError(),
    );
  });

  it('returns a collection of attention nodes', async () => {
    const nodes = [
      AttentionNode.restore({
        id: 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318',
        name: 'Arquitectura de software',
        description: 'Decisiones estructurales en sistemas reales.',
        createdAt: new Date('2026-07-20T12:00:00.000Z'),
        updatedAt: new Date('2026-07-20T12:00:00.000Z'),
      }),
    ];
    const fixture = createFixture();

    jest
      .spyOn(fixture.attentionNodeRepository, 'findByGoalId')
      .mockResolvedValue(nodes);

    await expect(fixture.useCase.execute({ goalId })).resolves.toEqual(nodes);
  });

  it('returns an empty collection', async () => {
    const fixture = createFixture();

    await expect(fixture.useCase.execute({ goalId })).resolves.toEqual([]);
  });

  it('delegates to the attention node repository', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({ goalId });

    expect(fixture.attentionNodeRepository.findByGoalId).toHaveBeenCalledTimes(1);
    expect(fixture.attentionNodeRepository.findByGoalId).toHaveBeenCalledWith(
      goalId,
    );
  });
});
