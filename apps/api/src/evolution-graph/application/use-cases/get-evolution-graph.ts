import {
  EvolutionGraph,
  EvolutionGraphQueryPort,
} from '../ports/evolution-graph.query-port';
import { FutureIdentityNotFoundError } from '../../../goal/application/errors/future-identity-not-found.error';

export const GET_EVOLUTION_GRAPH = Symbol('GET_EVOLUTION_GRAPH');

type GetEvolutionGraphRequest = {
  futureIdentityId: string;
};

export class GetEvolutionGraph {
  constructor(private readonly queryPort: EvolutionGraphQueryPort) {}

  async execute(request: GetEvolutionGraphRequest): Promise<EvolutionGraph> {
    const graph = await this.queryPort.findByFutureIdentityId(
      request.futureIdentityId,
    );

    if (!graph) {
      throw new FutureIdentityNotFoundError();
    }

    return graph;
  }
}
