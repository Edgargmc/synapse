export class GoalNotFoundError extends Error {
  readonly name = 'GoalNotFoundError';
  readonly code = 'GOAL_NOT_FOUND';
  readonly field = 'goalId';

  constructor() {
    super('La meta indicada no existe.');
  }
}
