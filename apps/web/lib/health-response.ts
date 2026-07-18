export type HealthResponse = {
  status: 'ok' | 'degraded';
  services: {
    database: 'up' | 'down';
  };
  timestamp: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const timestamp = new Date(value);

  return (
    !Number.isNaN(timestamp.getTime()) &&
    timestamp.toISOString() === value
  );
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (!isObject(value)) {
    return false;
  }

  if (value.status !== 'ok' && value.status !== 'degraded') {
    return false;
  }

  if (!isObject(value.services)) {
    return false;
  }

  if (
    value.services.database !== 'up' &&
    value.services.database !== 'down'
  ) {
    return false;
  }

  return isIsoUtcTimestamp(value.timestamp);
}
