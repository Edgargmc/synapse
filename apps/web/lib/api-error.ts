import { isObject } from './runtime';

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    field?: string;
  };
};

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
