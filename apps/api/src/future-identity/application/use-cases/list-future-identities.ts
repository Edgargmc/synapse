import { FutureIdentity } from '../../domain/future-identity';
import { FutureIdentityRepository } from '../ports/future-identity.repository';

export const LIST_FUTURE_IDENTITIES = Symbol('LIST_FUTURE_IDENTITIES');

export class ListFutureIdentities {
  constructor(private readonly repository: FutureIdentityRepository) {}

  async execute(): Promise<FutureIdentity[]> {
    return this.repository.findAll();
  }
}
