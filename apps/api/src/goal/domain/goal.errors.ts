export type GoalValidationErrorCode =
  | 'EMPTY_GOAL_DESIRED_OUTCOME'
  | 'GOAL_DESIRED_OUTCOME_TOO_LONG'
  | 'EMPTY_GOAL_PURPOSE'
  | 'GOAL_PURPOSE_TOO_LONG'
  | 'INVALID_GOAL_ID'
  | 'INVALID_GOAL_FUTURE_IDENTITY_ID'
  | 'INVALID_GOAL_TIMESTAMP';

export class GoalValidationError extends Error {
  readonly name = 'GoalValidationError';

  constructor(
    readonly code: GoalValidationErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}
