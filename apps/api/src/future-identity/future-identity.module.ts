import { Module } from '@nestjs/common';

import { CLOCK, Clock } from '../common/application/ports/clock';
import { ID_GENERATOR, IdGenerator } from '../common/application/ports/id-generator';
import { CommonSystemModule } from '../common/infrastructure/system/common-system.module';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import {
  FUTURE_IDENTITY_REPOSITORY,
  FutureIdentityRepository,
} from './application/ports/future-identity.repository';
import {
  CREATE_FUTURE_IDENTITY,
  CreateFutureIdentity,
} from './application/use-cases/create-future-identity';
import {
  LIST_FUTURE_IDENTITIES,
  ListFutureIdentities,
} from './application/use-cases/list-future-identities';
import { DrizzleFutureIdentityRepository } from './infrastructure/persistence/drizzle-future-identity.repository';
import { FutureIdentityController } from './presentation/future-identity.controller';

@Module({
  imports: [DatabaseModule, CommonSystemModule],
  controllers: [FutureIdentityController],
  providers: [
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
  exports: [FUTURE_IDENTITY_REPOSITORY],
})
export class FutureIdentityModule {}
