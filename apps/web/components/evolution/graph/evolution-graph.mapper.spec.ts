import { describe, expect, it } from 'vitest';

import { EvolutionGraphResponse } from '../../../lib/evolution-graph-api';
import { mapEvolutionGraphToFlowElements } from './evolution-graph.mapper';

const IDENTITY_ID = '11111111-1111-4111-8111-111111111111';
const GOAL_ID = '22222222-2222-4222-8222-222222222222';
const ATTENTION_NODE_ID = '33333333-3333-4333-8333-333333333333';

function buildGraph(): EvolutionGraphResponse {
  return {
    nodes: [
      {
        id: IDENTITY_ID,
        type: 'future_identity',
        label: 'Identity',
        description: 'Purpose',
      },
      {
        id: GOAL_ID,
        type: 'goal',
        label: 'Goal',
        description: 'Goal purpose',
      },
      {
        id: ATTENTION_NODE_ID,
        type: 'attention_node',
        label: 'Attention',
        description: null,
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

describe('mapEvolutionGraphToFlowElements', () => {
  it('asigna los custom node types correctos', () => {
    const positions = new Map([
      [IDENTITY_ID, { x: 0, y: 0 }],
      [GOAL_ID, { x: 10, y: 20 }],
      [ATTENTION_NODE_ID, { x: 30, y: 40 }],
    ]);

    const { nodes } = mapEvolutionGraphToFlowElements(buildGraph(), positions);

    expect(nodes.map((node) => node.type)).toEqual([
      'future_identity',
      'goal',
      'attention_node',
    ]);
  });

  it('preserva las posiciones calculadas', () => {
    const positions = new Map([
      [IDENTITY_ID, { x: 0, y: 0 }],
      [GOAL_ID, { x: 120, y: -45 }],
      [ATTENTION_NODE_ID, { x: 360, y: 200 }],
    ]);

    const { nodes } = mapEvolutionGraphToFlowElements(buildGraph(), positions);

    expect(nodes.find((node) => node.id === GOAL_ID)?.position).toEqual({
      x: 120,
      y: -45,
    });
  });

  it('genera IDs deterministas para edges', () => {
    const positions = new Map<string, { x: number; y: number }>();
    const { edges } = mapEvolutionGraphToFlowElements(buildGraph(), positions);

    expect(edges.map((edge) => edge.id)).toEqual([
      `has_attention_node:${GOAL_ID}->${ATTENTION_NODE_ID}`,
      `has_goal:${IDENTITY_ID}->${GOAL_ID}`,
    ]);
  });

  it('preserva todas las relaciones', () => {
    const positions = new Map<string, { x: number; y: number }>();
    const { edges } = mapEvolutionGraphToFlowElements(buildGraph(), positions);

    expect(edges).toHaveLength(2);
    expect(edges.find((edge) => edge.source === GOAL_ID)?.target).toBe(
      ATTENTION_NODE_ID,
    );
  });

  it('no duplica nodos', () => {
    const positions = new Map<string, { x: number; y: number }>();
    const { nodes } = mapEvolutionGraphToFlowElements(buildGraph(), positions);

    expect(new Set(nodes.map((node) => node.id)).size).toBe(nodes.length);
  });
});
