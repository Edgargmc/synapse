import { FutureIdentity } from '../../domain/future-identity';
import { Clock } from '../ports/clock';
import { IdGenerator } from '../ports/id-generator';
import { FutureIdentityRepository } from '../ports/future-identity.repository';

export const CREATE_FUTURE_IDENTITY = Symbol('CREATE_FUTURE_IDENTITY');

export type CreateFutureIdentityInput = {
  statement: string;
  purpose: string;
};

export class CreateFutureIdentity {
  constructor(
    private readonly repository: FutureIdentityRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateFutureIdentityInput): Promise<FutureIdentity> {
    const identity = FutureIdentity.create({
      id: this.idGenerator.generate(),
      statement: input.statement,
      purpose: input.purpose,
      now: this.clock.now(),
    });

    await this.repository.save(identity);

    return identity;
  }
}
