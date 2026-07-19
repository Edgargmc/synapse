import { FutureIdentityNotFoundError } from '../../../goal/application/errors/future-identity-not-found.error';
import {
  EvolutionGraph,
  EvolutionGraphQueryPort,
} from '../ports/evolution-graph.query-port';
import { GetEvolutionGraph } from './get-evolution-graph';

describe('GetEvolutionGraph', () => {
  const futureIdentityId = '8b0ce0bb-2a66-4d0b-b457-8d98df479a01';
  const futureIdentityNodeId = futureIdentityId;
  const firstGoalId = '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6';
  const secondGoalId = 'b77e74bf-cd72-47de-a344-1524aa7d223e';
  const firstAttentionNodeId = 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318';
  const secondAttentionNodeId = '4e8c4ff2-2a45-4c0d-a647-695f07bdcc76';

  function buildCompleteGraph(): EvolutionGraph {
    return {
      nodes: [
        {
          id: futureIdentityNodeId,
          type: 'future_identity',
          label: 'Solution Architect',
          description: 'Construir criterio tecnico y de producto.',
        },
        {
          id: firstGoalId,
          type: 'goal',
          label: 'Dominar arquitectura cloud',
          description: 'Por que esta transformacion importa.',
        },
        {
          id: secondGoalId,
          type: 'goal',
          label: 'Disenar sistemas con IA aplicada',
          description: 'Convertir teoria en experiencia practica.',
        },
        {
          id: firstAttentionNodeId,
          type: 'attention_node',
          label: 'AWS',
          description: 'Profundizar en servicios cloud.',
        },
        {
          id: secondAttentionNodeId,
          type: 'attention_node',
          label: 'Evaluacion de modelos',
          description: null,
        },
      ],
      relationships: [
        {
          from: futureIdentityNodeId,
          to: firstGoalId,
          type: 'has_goal',
        },
        {
          from: futureIdentityNodeId,
          to: secondGoalId,
          type: 'has_goal',
        },
        {
          from: firstGoalId,
          to: firstAttentionNodeId,
          type: 'has_attention_node',
        },
        {
          from: secondGoalId,
          to: secondAttentionNodeId,
          type: 'has_attention_node',
        },
      ],
    };
  }

  function createFixture(graph: EvolutionGraph | null = buildCompleteGraph()) {
    const queryPort: EvolutionGraphQueryPort = {
      findByFutureIdentityId: jest.fn().mockResolvedValue(graph),
    };

    return {
      queryPort,
      useCase: new GetEvolutionGraph(queryPort),
    };
  }

  it('delegates the lookup to the read port', async () => {
    const fixture = createFixture();

    await fixture.useCase.execute({ futureIdentityId });

    expect(fixture.queryPort.findByFutureIdentityId).toHaveBeenCalledTimes(1);
    expect(fixture.queryPort.findByFutureIdentityId).toHaveBeenCalledWith(
      futureIdentityId,
    );
  });

  it('returns a complete graph with goals and attention nodes', async () => {
    const graph = buildCompleteGraph();
    const fixture = createFixture(graph);

    await expect(fixture.useCase.execute({ futureIdentityId })).resolves.toEqual(
      graph,
    );
  });

  it('returns only the identity node when the identity has no goals', async () => {
    const graph: EvolutionGraph = {
      nodes: [
        {
          id: futureIdentityNodeId,
          type: 'future_identity',
          label: 'Solution Architect',
          description: 'Construir criterio tecnico y de producto.',
        },
      ],
      relationships: [],
    };
    const fixture = createFixture(graph);

    await expect(fixture.useCase.execute({ futureIdentityId })).resolves.toEqual(
      graph,
    );
  });

  it('keeps a goal node when it has no attention nodes', async () => {
    const graph: EvolutionGraph = {
      nodes: [
        {
          id: futureIdentityNodeId,
          type: 'future_identity',
          label: 'Solution Architect',
          description: 'Construir criterio tecnico y de producto.',
        },
        {
          id: firstGoalId,
          type: 'goal',
          label: 'Dominar arquitectura cloud',
          description: 'Por que esta transformacion importa.',
        },
      ],
      relationships: [
        {
          from: futureIdentityNodeId,
          to: firstGoalId,
          type: 'has_goal',
        },
      ],
    };
    const fixture = createFixture(graph);

    await expect(fixture.useCase.execute({ futureIdentityId })).resolves.toEqual(
      graph,
    );
  });

  it('returns a logical 404 when the future identity does not exist', async () => {
    const fixture = createFixture(null);

    await expect(fixture.useCase.execute({ futureIdentityId })).rejects.toEqual(
      new FutureIdentityNotFoundError(),
    );
  });

  it('does not return duplicated nodes', async () => {
    const graph = buildCompleteGraph();
    const fixture = createFixture(graph);

    const result = await fixture.useCase.execute({ futureIdentityId });
    const nodeIds = result.nodes.map((node) => node.id);

    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });

  it('returns relationships that point to existing nodes', async () => {
    const graph = buildCompleteGraph();
    const fixture = createFixture(graph);

    const result = await fixture.useCase.execute({ futureIdentityId });
    const nodeIds = new Set(result.nodes.map((node) => node.id));

    for (const relationship of result.relationships) {
      expect(nodeIds.has(relationship.from)).toBe(true);
      expect(nodeIds.has(relationship.to)).toBe(true);
    }
  });

  it('preserves the deterministic order provided by the read model', async () => {
    const graph = buildCompleteGraph();
    const fixture = createFixture(graph);

    const result = await fixture.useCase.execute({ futureIdentityId });

    expect(result.nodes.map((node) => node.id)).toEqual([
      futureIdentityNodeId,
      firstGoalId,
      secondGoalId,
      firstAttentionNodeId,
      secondAttentionNodeId,
    ]);
    expect(result.relationships).toEqual(graph.relationships);
  });
});
