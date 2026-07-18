export type FutureIdentityItem = {
  id: string;
  statement: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
};

export type FutureIdentityListResponse = {
  items: FutureIdentityItem[];
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    field?: string;
  };
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

export function isFutureIdentityItem(value: unknown): value is FutureIdentityItem {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    UUID_PATTERN.test(value.id) &&
    typeof value.statement === 'string' &&
    typeof value.purpose === 'string' &&
    isIsoUtcTimestamp(value.createdAt) &&
    isIsoUtcTimestamp(value.updatedAt)
  );
}

export function isFutureIdentityListResponse(
  value: unknown,
): value is FutureIdentityListResponse {
  return (
    isObject(value) &&
    Array.isArray(value.items) &&
    value.items.every(isFutureIdentityItem)
  );
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isObject(value) || !isObject(value.error)) {
    return false;
  }

  return (
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string' &&
    (value.error.field === undefined || typeof value.error.field === 'string')
  );
}
