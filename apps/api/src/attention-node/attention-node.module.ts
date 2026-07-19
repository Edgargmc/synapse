import { Module } from '@nestjs/common';

import { CLOCK, Clock } from '../common/application/ports/clock';
import { ID_GENERATOR, IdGenerator } from '../common/application/ports/id-generator';
import { CommonSystemModule } from '../common/infrastructure/system/common-system.module';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { GOAL_REPOSITORY, GoalRepository } from '../goal/application/ports/goal.repository';
import { GoalModule } from '../goal/goal.module';
import {
  ATTENTION_NODE_REPOSITORY,
  AttentionNodeRepository,
} from './application/ports/attention-node.repository';
import {
  CREATE_AND_ATTACH_ATTENTION_NODE,
  CreateAndAttachAttentionNode,
} from './application/use-cases/create-and-attach-attention-node';
import {
  LIST_ATTENTION_NODES_BY_GOAL,
  ListAttentionNodesByGoal,
} from './application/use-cases/list-attention-nodes-by-goal';
import { DrizzleAttentionNodeRepository } from './infrastructure/persistence/drizzle-attention-node.repository';
import { AttentionNodeController } from './presentation/attention-node.controller';

@Module({
  imports: [DatabaseModule, GoalModule, CommonSystemModule],
  controllers: [AttentionNodeController],
  providers: [
    {
      provide: ATTENTION_NODE_REPOSITORY,
      useFactory: (
        databaseService: DatabaseService,
      ): AttentionNodeRepository =>
        new DrizzleAttentionNodeRepository(databaseService.getDb()),
      inject: [DatabaseService],
    },
    {
      provide: CREATE_AND_ATTACH_ATTENTION_NODE,
      useFactory: (
        goalRepository: GoalRepository,
        attentionNodeRepository: AttentionNodeRepository,
        idGenerator: IdGenerator,
        clock: Clock,
      ) =>
        new CreateAndAttachAttentionNode(
          goalRepository,
          attentionNodeRepository,
          idGenerator,
          clock,
        ),
      inject: [GOAL_REPOSITORY, ATTENTION_NODE_REPOSITORY, ID_GENERATOR, CLOCK],
    },
    {
      provide: LIST_ATTENTION_NODES_BY_GOAL,
      useFactory: (
        goalRepository: GoalRepository,
        attentionNodeRepository: AttentionNodeRepository,
      ) =>
        new ListAttentionNodesByGoal(goalRepository, attentionNodeRepository),
      inject: [GOAL_REPOSITORY, ATTENTION_NODE_REPOSITORY],
    },
  ],
})
export class AttentionNodeModule {}
