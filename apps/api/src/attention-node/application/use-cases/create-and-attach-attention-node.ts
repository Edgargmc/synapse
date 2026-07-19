import { Clock } from '../../../common/application/ports/clock';
import { IdGenerator } from '../../../common/application/ports/id-generator';
import { GoalRepository } from '../../../goal/application/ports/goal.repository';
import { AttentionNode } from '../../domain/attention-node';
import { GoalNotFoundError } from '../errors/goal-not-found.error';
import { AttentionNodeRepository } from '../ports/attention-node.repository';

export const CREATE_AND_ATTACH_ATTENTION_NODE = Symbol(
  'CREATE_AND_ATTACH_ATTENTION_NODE',
);

export type CreateAndAttachAttentionNodeInput = {
  goalId: string;
  name: string;
  description?: string | null;
};

export class CreateAndAttachAttentionNode {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly attentionNodeRepository: AttentionNodeRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: CreateAndAttachAttentionNodeInput,
  ): Promise<AttentionNode> {
    const goal = await this.goalRepository.findById(input.goalId);

    if (!goal) {
      throw new GoalNotFoundError();
    }

    const node = AttentionNode.create({
      id: this.idGenerator.generate(),
      name: input.name,
      description: input.description,
      now: this.clock.now(),
    });

    await this.attentionNodeRepository.createAndAttachToGoal(node, goal.id);

    return node;
  }
}
