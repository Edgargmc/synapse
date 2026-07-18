import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { CLOCK, Clock } from './application/ports/clock';
import {
  FUTURE_IDENTITY_REPOSITORY,
  FutureIdentityRepository,
} from './application/ports/future-identity.repository';
import { ID_GENERATOR, IdGenerator } from './application/ports/id-generator';
import {
  CREATE_FUTURE_IDENTITY,
  CreateFutureIdentity,
} from './application/use-cases/create-future-identity';
import {
  LIST_FUTURE_IDENTITIES,
  ListFutureIdentities,
} from './application/use-cases/list-future-identities';
import { DrizzleFutureIdentityRepository } from './infrastructure/persistence/drizzle-future-identity.repository';
import { RandomUuidGenerator } from './infrastructure/system/random-uuid-generator';
import { SystemClock } from './infrastructure/system/system-clock';
import { FutureIdentityController } from './presentation/future-identity.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FutureIdentityController],
  providers: [
    {
      provide: CLOCK,
      useFactory: () => new SystemClock(),
    },
    {
      provide: ID_GENERATOR,
      useFactory: () => new RandomUuidGenerator(),
    },
    {
      provide: FUTURE_IDENTITY_REPOSITORY,
      useFactory: (databaseService: DatabaseService): FutureIdentityRepository =>
        new DrizzleFutureIdentityRepository(databaseService.getDb()),
      inject: [DatabaseService],
    },
    {
      provide: CREATE_FUTURE_IDENTITY,
      useFactory: (
        repository: FutureIdentityRepository,
        idGenerator: IdGenerator,
        clock: Clock,
      ) => new CreateFutureIdentity(repository, idGenerator, clock),
      inject: [FUTURE_IDENTITY_REPOSITORY, ID_GENERATOR, CLOCK],
    },
    {
      provide: LIST_FUTURE_IDENTITIES,
      useFactory: (repository: FutureIdentityRepository) =>
        new ListFutureIdentities(repository),
      inject: [FUTURE_IDENTITY_REPOSITORY],
    },
  ],
})
export class FutureIdentityModule {}
