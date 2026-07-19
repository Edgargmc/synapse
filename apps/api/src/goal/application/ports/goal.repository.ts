import { Goal } from '../../domain/goal';

export const GOAL_REPOSITORY = Symbol('GOAL_REPOSITORY');

export interface GoalRepository {
  save(goal: Goal): Promise<void>;
  findById(id: string): Promise<Goal | null>;
  findByFutureIdentityId(futureIdentityId: string): Promise<Goal[]>;
}
