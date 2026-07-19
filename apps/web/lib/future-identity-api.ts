import { ApiErrorResponse, isApiErrorResponse } from './api-error';
import { isIsoUtcTimestamp, isObject, UUID_PATTERN } from './runtime';

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

export type { ApiErrorResponse };
export { isApiErrorResponse };
