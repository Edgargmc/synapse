import { Module } from '@nestjs/common';

import { AttentionNodeModule } from './attention-node/attention-node.module';
import { EvolutionGraphModule } from './evolution-graph/evolution-graph.module';
import { FutureIdentityModule } from './future-identity/future-identity.module';
import { GoalModule } from './goal/goal.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    FutureIdentityModule,
    GoalModule,
    AttentionNodeModule,
    EvolutionGraphModule,
  ],
})
export class AppModule {}
