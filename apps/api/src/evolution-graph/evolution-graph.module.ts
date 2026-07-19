import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import {
  EVOLUTION_GRAPH_QUERY_PORT,
  EvolutionGraphQueryPort,
} from './application/ports/evolution-graph.query-port';
import {
  GET_EVOLUTION_GRAPH,
  GetEvolutionGraph,
} from './application/use-cases/get-evolution-graph';
import { DrizzleEvolutionGraphQuery } from './infrastructure/persistence/drizzle-evolution-graph.query';
import { EvolutionGraphController } from './presentation/evolution-graph.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [EvolutionGraphController],
  providers: [
    {
      provide: EVOLUTION_GRAPH_QUERY_PORT,
      useFactory: (databaseService: DatabaseService): EvolutionGraphQueryPort =>
        new DrizzleEvolutionGraphQuery(databaseService.getDb()),
      inject: [DatabaseService],
    },
    {
      provide: GET_EVOLUTION_GRAPH,
      useFactory: (queryPort: EvolutionGraphQueryPort) =>
        new GetEvolutionGraph(queryPort),
      inject: [EVOLUTION_GRAPH_QUERY_PORT],
    },
  ],
})
export class EvolutionGraphModule {}
