export type DomainValidationErrorCode =
  | 'EMPTY_FUTURE_IDENTITY_STATEMENT'
  | 'FUTURE_IDENTITY_STATEMENT_TOO_LONG'
  | 'EMPTY_FUTURE_IDENTITY_PURPOSE'
  | 'FUTURE_IDENTITY_PURPOSE_TOO_LONG'
  | 'INVALID_FUTURE_IDENTITY_ID'
  | 'INVALID_FUTURE_IDENTITY_TIMESTAMP';

export class DomainValidationError extends Error {
  readonly name = 'DomainValidationError';

  constructor(
    readonly code: DomainValidationErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}
