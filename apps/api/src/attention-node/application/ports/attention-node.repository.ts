import { AttentionNode } from '../../domain/attention-node';

export const ATTENTION_NODE_REPOSITORY = Symbol('ATTENTION_NODE_REPOSITORY');

export interface AttentionNodeRepository {
  createAndAttachToGoal(node: AttentionNode, goalId: string): Promise<void>;
  findByGoalId(goalId: string): Promise<AttentionNode[]>;
}
