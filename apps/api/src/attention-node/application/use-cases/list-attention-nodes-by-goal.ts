import { GoalRepository } from '../../../goal/application/ports/goal.repository';
import { AttentionNode } from '../../domain/attention-node';
import { GoalNotFoundError } from '../errors/goal-not-found.error';
import { AttentionNodeRepository } from '../ports/attention-node.repository';

export const LIST_ATTENTION_NODES_BY_GOAL = Symbol(
  'LIST_ATTENTION_NODES_BY_GOAL',
);

export type ListAttentionNodesByGoalInput = {
  goalId: string;
};

export class ListAttentionNodesByGoal {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly attentionNodeRepository: AttentionNodeRepository,
  ) {}

  async execute(input: ListAttentionNodesByGoalInput): Promise<AttentionNode[]> {
    const goal = await this.goalRepository.findById(input.goalId);

    if (!goal) {
      throw new GoalNotFoundError();
    }

    return this.attentionNodeRepository.findByGoalId(goal.id);
  }
}
