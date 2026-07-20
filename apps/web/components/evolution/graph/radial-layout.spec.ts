import { describe, expect, it } from 'vitest';

import { EvolutionGraphResponse } from '../../../lib/evolution-graph-api';
import { buildRadialLayout } from './radial-layout';

const IDENTITY_ID = '11111111-1111-4111-8111-111111111111';
const GOAL_A_ID = '22222222-2222-4222-8222-222222222222';
const GOAL_B_ID = '33333333-3333-4333-8333-333333333333';
const ATTENTION_A_ID = '44444444-4444-4444-8444-444444444444';
const ATTENTION_SHARED_ID = '55555555-5555-4555-8555-555555555555';

function buildGraph(
  overrides?: Partial<EvolutionGraphResponse>,
): EvolutionGraphResponse {
  return {
    nodes: [
      {
        id: IDENTITY_ID,
        type: 'future_identity',
        label: 'Identity',
        description: 'Purpose',
      },
      {
        id: GOAL_A_ID,
        type: 'goal',
        label: 'Goal A',
        description: 'Goal A purpose',
      },
      {
        id: GOAL_B_ID,
        type: 'goal',
        label: 'Goal B',
        description: 'Goal B purpose',
      },
      {
        id: ATTENTION_A_ID,
        type: 'attention_node',
        label: 'Attention A',
        description: null,
      },
      {
        id: ATTENTION_SHARED_ID,
        type: 'attention_node',
        label: 'Attention Shared',
        description: null,
      },
    ],
    relationships: [
      {
        from: IDENTITY_ID,
        to: GOAL_A_ID,
        type: 'has_goal',
      },
      {
        from: IDENTITY_ID,
        to: GOAL_B_ID,
        type: 'has_goal',
      },
      {
        from: GOAL_A_ID,
        to: ATTENTION_A_ID,
        type: 'has_attention_node',
      },
      {
        from: GOAL_A_ID,
        to: ATTENTION_SHARED_ID,
        type: 'has_attention_node',
      },
      {
        from: GOAL_B_ID,
        to: ATTENTION_SHARED_ID,
        type: 'has_attention_node',
      },
    ],
    ...overrides,
  };
}

describe('buildRadialLayout', () => {
  function expectPointCloseTo(
    point: { x: number; y: number } | undefined,
    expected: { x: number; y: number },
  ) {
    expect(point).toBeDefined();
    expect(point?.x).toBeCloseTo(expected.x, 8);
    expect(point?.y).toBeCloseTo(expected.y, 8);
  }

  it('ubica la identidad en el centro', () => {
    const positions = buildRadialLayout(buildGraph());

    expectPointCloseTo(positions.get(IDENTITY_ID), { x: 0, y: 0 });
  });

  it('ubica una sola goal en el anillo interior', () => {
    const positions = buildRadialLayout(
      buildGraph({
        nodes: buildGraph().nodes.filter((node) => node.id !== GOAL_B_ID),
        relationships: buildGraph().relationships.filter(
          (relationship) =>
            relationship.to !== GOAL_B_ID && relationship.from !== GOAL_B_ID,
        ),
      }),
    );

    expectPointCloseTo(positions.get(GOAL_A_ID), { x: 0, y: -280 });
  });

  it('distribuye varias goals de forma uniforme', () => {
    const positions = buildRadialLayout(buildGraph());

    expectPointCloseTo(positions.get(GOAL_A_ID), { x: 0, y: -280 });
    expectPointCloseTo(positions.get(GOAL_B_ID), { x: 0, y: 280 });
  });

  it('mantiene visible una goal sin attention nodes', () => {
    const positions = buildRadialLayout(
      buildGraph({
        relationships: buildGraph().relationships.filter(
          (relationship) => relationship.from !== GOAL_B_ID,
        ),
      }),
    );

    expectPointCloseTo(positions.get(GOAL_B_ID), { x: 0, y: 280 });
  });

  it('es determinista para el mismo grafo', () => {
    const graph = buildGraph();

    expect(buildRadialLayout(graph)).toEqual(buildRadialLayout(graph));
  });

  it('ubica un nodo compartido una sola vez', () => {
    const positions = buildRadialLayout(buildGraph());

    expect(positions.get(ATTENTION_SHARED_ID)).toBeDefined();
    expect(
      Array.from(positions.keys()).filter((id) => id === ATTENTION_SHARED_ID),
    ).toHaveLength(1);
  });

  it('usa un fallback determinista cuando los vectores se cancelan', () => {
    const positions = buildRadialLayout(buildGraph());
    const sharedNodePosition = positions.get(ATTENTION_SHARED_ID);

    expectPointCloseTo(sharedNodePosition, { x: 0, y: -520 });
  });
});
