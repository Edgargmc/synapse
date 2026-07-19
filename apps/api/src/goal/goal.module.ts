import { Module } from '@nestjs/common';

import { CommonSystemModule } from '../common/infrastructure/system/common-system.module';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { FUTURE_IDENTITY_REPOSITORY, FutureIdentityRepository } from '../future-identity/application/ports/future-identity.repository';
import { FutureIdentityModule } from '../future-identity/future-identity.module';
import { CLOCK, Clock } from '../common/application/ports/clock';
import { ID_GENERATOR, IdGenerator } from '../common/application/ports/id-generator';
import { GOAL_REPOSITORY, GoalRepository } from './application/ports/goal.repository';
import { CREATE_GOAL, CreateGoal } from './application/use-cases/create-goal';
import {
  LIST_GOALS_BY_FUTURE_IDENTITY,
  ListGoalsByFutureIdentity,
} from './application/use-cases/list-goals-by-future-identity';
import { DrizzleGoalRepository } from './infrastructure/persistence/drizzle-goal.repository';
import { GoalController } from './presentation/goal.controller';

@Module({
  imports: [DatabaseModule, FutureIdentityModule, CommonSystemModule],
  controllers: [GoalController],
  providers: [
    {
      provide: GOAL_REPOSITORY,
      useFactory: (databaseService: DatabaseService): GoalRepository =>
        new DrizzleGoalRepository(databaseService.getDb()),
      inject: [DatabaseService],
    },
    {
      provide: CREATE_GOAL,
      useFactory: (
        futureIdentityRepository: FutureIdentityRepository,
        goalRepository: GoalRepository,
        idGenerator: IdGenerator,
        clock: Clock,
      ) =>
        new CreateGoal(
          futureIdentityRepository,
          goalRepository,
          idGenerator,
          clock,
        ),
      inject: [FUTURE_IDENTITY_REPOSITORY, GOAL_REPOSITORY, ID_GENERATOR, CLOCK],
    },
    {
      provide: LIST_GOALS_BY_FUTURE_IDENTITY,
      useFactory: (
        futureIdentityRepository: FutureIdentityRepository,
        goalRepository: GoalRepository,
      ) =>
        new ListGoalsByFutureIdentity(
          futureIdentityRepository,
          goalRepository,
        ),
      inject: [FUTURE_IDENTITY_REPOSITORY, GOAL_REPOSITORY],
    },
  ],
  exports: [GOAL_REPOSITORY],
})
export class GoalModule {}
