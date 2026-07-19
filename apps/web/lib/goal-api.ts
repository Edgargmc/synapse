import { isIsoUtcTimestamp, isObject, UUID_PATTERN } from './runtime';

export type GoalItem = {
  id: string;
  futureIdentityId: string;
  desiredOutcome: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
};

export type GoalListResponse = {
  items: GoalItem[];
};

export function isGoalItem(value: unknown): value is GoalItem {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    UUID_PATTERN.test(value.id) &&
    typeof value.futureIdentityId === 'string' &&
    UUID_PATTERN.test(value.futureIdentityId) &&
    typeof value.desiredOutcome === 'string' &&
    typeof value.purpose === 'string' &&
    isIsoUtcTimestamp(value.createdAt) &&
    isIsoUtcTimestamp(value.updatedAt)
  );
}

export function isGoalListResponse(value: unknown): value is GoalListResponse {
  return (
    isObject(value) &&
    Array.isArray(value.items) &&
    value.items.every(isGoalItem)
  );
}
