import { describe, expect, it } from 'vitest';

import {
  EvolutionGraphResponse,
  isEvolutionGraphResponse,
  validateEvolutionGraphResponse,
} from './evolution-graph-api';

const IDENTITY_ID = '11111111-1111-4111-8111-111111111111';
const GOAL_ID = '22222222-2222-4222-8222-222222222222';
const ATTENTION_NODE_ID = '33333333-3333-4333-8333-333333333333';

function buildGraph(): EvolutionGraphResponse {
  return {
    nodes: [
      {
        id: IDENTITY_ID,
        type: 'future_identity',
        label: 'Arquitecto de producto',
        description: 'Construir con criterio tecnico y foco en impacto.',
      },
      {
        id: GOAL_ID,
        type: 'goal',
        label: 'Diseñar un producto real con IA',
        description: 'Convertir teoria en una entrega concreta.',
      },
      {
        id: ATTENTION_NODE_ID,
        type: 'attention_node',
        label: 'Arquitectura de software',
        description: 'Decisiones estructurales con trade-offs claros.',
      },
    ],
    relationships: [
      {
        from: IDENTITY_ID,
        to: GOAL_ID,
        type: 'has_goal',
      },
      {
        from: GOAL_ID,
        to: ATTENTION_NODE_ID,
        type: 'has_attention_node',
      },
    ],
  };
}

describe('evolution-graph-api', () => {
  it('acepta un contrato valido', () => {
    const graph = buildGraph();

    expect(validateEvolutionGraphResponse(graph)).toEqual(graph);
    expect(isEvolutionGraphResponse(graph)).toBe(true);
  });

  it('acepta description null', () => {
    const graph = buildGraph();
    graph.nodes[2] = {
      ...graph.nodes[2],
      description: null,
    };

    expect(validateEvolutionGraphResponse(graph).nodes[2]?.description).toBeNull();
  });

  it('rechaza UUID invalido', () => {
    const graph = buildGraph();
    graph.nodes[1] = {
      ...graph.nodes[1],
      id: 'goal-invalida',
    };

    expect(() => validateEvolutionGraphResponse(graph)).toThrow();
    expect(isEvolutionGraphResponse(graph)).toBe(false);
  });

  it('rechaza tipo de nodo invalido', () => {
    const validGraph = buildGraph();
    const graph: unknown = {
      ...validGraph,
      nodes: [
        validGraph.nodes[0],
        validGraph.nodes[1],
        {
          ...validGraph.nodes[2],
          type: 'task',
        },
      ],
    };

    expect(() => validateEvolutionGraphResponse(graph)).toThrow();
  });

  it('rechaza IDs duplicados', () => {
    const graph = buildGraph();
    graph.nodes[2] = {
      ...graph.nodes[2],
      id: GOAL_ID,
    };

    expect(() => validateEvolutionGraphResponse(graph)).toThrow();
  });

  it('rechaza relaciones hacia nodos inexistentes', () => {
    const graph = buildGraph();
    graph.relationships[1] = {
      from: GOAL_ID,
      to: '44444444-4444-4444-8444-444444444444',
      type: 'has_attention_node',
    };

    expect(() => validateEvolutionGraphResponse(graph)).toThrow();
  });
});
