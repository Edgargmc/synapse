export class FutureIdentityNotFoundError extends Error {
  readonly name = 'FutureIdentityNotFoundError';
  readonly code = 'FUTURE_IDENTITY_NOT_FOUND';
  readonly field = 'futureIdentityId';

  constructor() {
    super('La identidad futura indicada no existe.');
  }
}
