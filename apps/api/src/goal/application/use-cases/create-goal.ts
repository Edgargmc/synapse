import { Clock } from '../../../common/application/ports/clock';
import { IdGenerator } from '../../../common/application/ports/id-generator';
import {
  FutureIdentityRepository,
} from '../../../future-identity/application/ports/future-identity.repository';
import { Goal } from '../../domain/goal';
import { FutureIdentityNotFoundError } from '../errors/future-identity-not-found.error';
import { GoalRepository } from '../ports/goal.repository';

export const CREATE_GOAL = Symbol('CREATE_GOAL');

export type CreateGoalInput = {
  futureIdentityId: string;
  desiredOutcome: string;
  purpose: string;
};

export class CreateGoal {
  constructor(
    private readonly futureIdentityRepository: FutureIdentityRepository,
    private readonly goalRepository: GoalRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateGoalInput): Promise<Goal> {
    const futureIdentity = await this.futureIdentityRepository.findById(
      input.futureIdentityId,
    );

    if (!futureIdentity) {
      throw new FutureIdentityNotFoundError();
    }

    const goal = Goal.create({
      id: this.idGenerator.generate(),
      futureIdentityId: futureIdentity.id,
      desiredOutcome: input.desiredOutcome,
      purpose: input.purpose,
      now: this.clock.now(),
    });

    await this.goalRepository.save(goal);

    return goal;
  }
}
