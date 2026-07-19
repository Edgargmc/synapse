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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

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
