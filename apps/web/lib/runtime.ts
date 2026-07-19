export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isIsoUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}
