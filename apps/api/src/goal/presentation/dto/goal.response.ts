import { Goal } from '../../domain/goal';

export type GoalResponse = {
  id: string;
  futureIdentityId: string;
  desiredOutcome: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
};

export function toGoalResponse(goal: Goal): GoalResponse {
  return {
    id: goal.id,
    futureIdentityId: goal.futureIdentityId,
    desiredOutcome: goal.desiredOutcome,
    purpose: goal.purpose,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}
