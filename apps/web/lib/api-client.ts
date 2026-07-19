import { isApiErrorResponse } from './api-error';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getApiErrorMessage(payload: unknown, fallback: string) {
  if (isApiErrorResponse(payload)) {
    return payload.error.message;
  }

  return fallback;
}
