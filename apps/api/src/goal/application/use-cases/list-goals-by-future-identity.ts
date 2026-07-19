import {
  FutureIdentityRepository,
} from '../../../future-identity/application/ports/future-identity.repository';
import { Goal } from '../../domain/goal';
import { FutureIdentityNotFoundError } from '../errors/future-identity-not-found.error';
import { GoalRepository } from '../ports/goal.repository';

export const LIST_GOALS_BY_FUTURE_IDENTITY = Symbol(
  'LIST_GOALS_BY_FUTURE_IDENTITY',
);

export type ListGoalsByFutureIdentityInput = {
  futureIdentityId: string;
};

export class ListGoalsByFutureIdentity {
  constructor(
    private readonly futureIdentityRepository: FutureIdentityRepository,
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(input: ListGoalsByFutureIdentityInput): Promise<Goal[]> {
    const futureIdentity = await this.futureIdentityRepository.findById(
      input.futureIdentityId,
    );

    if (!futureIdentity) {
      throw new FutureIdentityNotFoundError();
    }

    return this.goalRepository.findByFutureIdentityId(futureIdentity.id);
  }
}
