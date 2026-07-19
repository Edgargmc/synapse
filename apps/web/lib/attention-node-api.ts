import { isIsoUtcTimestamp, isObject, UUID_PATTERN } from './runtime';

export type AttentionNodeItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AttentionNodeListResponse = {
  items: AttentionNodeItem[];
};

export function isAttentionNodeItem(value: unknown): value is AttentionNodeItem {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    UUID_PATTERN.test(value.id) &&
    typeof value.name === 'string' &&
    (value.description === null || typeof value.description === 'string') &&
    isIsoUtcTimestamp(value.createdAt) &&
    isIsoUtcTimestamp(value.updatedAt)
  );
}

export function isAttentionNodeListResponse(
  value: unknown,
): value is AttentionNodeListResponse {
  return (
    isObject(value) &&
    Array.isArray(value.items) &&
    value.items.every(isAttentionNodeItem)
  );
}
