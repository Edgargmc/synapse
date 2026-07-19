export type AttentionNodeValidationErrorCode =
  | 'EMPTY_ATTENTION_NODE_NAME'
  | 'ATTENTION_NODE_NAME_TOO_LONG'
  | 'ATTENTION_NODE_DESCRIPTION_TOO_LONG'
  | 'INVALID_ATTENTION_NODE_ID'
  | 'INVALID_ATTENTION_NODE_TIMESTAMP';

export class AttentionNodeValidationError extends Error {
  readonly name = 'AttentionNodeValidationError';

  constructor(
    readonly code: AttentionNodeValidationErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}
