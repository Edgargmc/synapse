import { FutureIdentity } from '../../domain/future-identity';

export const FUTURE_IDENTITY_REPOSITORY = Symbol('FUTURE_IDENTITY_REPOSITORY');

export interface FutureIdentityRepository {
  save(identity: FutureIdentity): Promise<void>;
  findAll(): Promise<FutureIdentity[]>;
}
