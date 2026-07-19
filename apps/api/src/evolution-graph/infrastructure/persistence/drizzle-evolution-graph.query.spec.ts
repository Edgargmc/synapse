import { buildEvolutionGraphProjection } from './drizzle-evolution-graph.query';

describe('buildEvolutionGraphProjection', () => {
  const identity = {
    id: '8b0ce0bb-2a66-4d0b-b457-8d98df479a01',
    statement: 'Solution Architect',
    purpose: 'Construir criterio tecnico y de producto.',
  };
  const firstGoal = {
    id: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
    desiredOutcome: 'Dominar arquitectura cloud',
    purpose: 'Por que esta transformacion importa.',
    createdAt: new Date('2026-07-19T10:00:00.000Z'),
  };
  const secondGoal = {
    id: 'b77e74bf-cd72-47de-a344-1524aa7d223e',
    desiredOutcome: 'Disenar sistemas con IA aplicada',
    purpose: 'Convertir teoria en experiencia practica.',
    createdAt: new Date('2026-07-20T10:00:00.000Z'),
  };
  const firstAttentionNode = {
    goalId: firstGoal.id,
    id: 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318',
    name: 'AWS',
    description: 'Profundizar en servicios cloud.',
    createdAt: new Date('2026-07-21T10:00:00.000Z'),
  };
  const secondAttentionNode = {
    goalId: secondGoal.id,
    id: '4e8c4ff2-2a45-4c0d-a647-695f07bdcc76',
    name: 'Evaluacion de modelos',
    description: null,
    createdAt: new Date('2026-07-22T10:00:00.000Z'),
  };

  it('builds nodes and relationships for a complete graph', () => {
    const graph = buildEvolutionGraphProjection({
      identity,
      goals: [firstGoal],
      attentionNodes: [firstAttentionNode],
    });

    expect(graph).toEqual({
      nodes: [
        {
          id: identity.id,
          type: 'future_identity',
          label: identity.statement,
          description: identity.purpose,
        },
        {
          id: firstGoal.id,
          type: 'goal',
          label: firstGoal.desiredOutcome,
          description: firstGoal.purpose,
        },
        {
          id: firstAttentionNode.id,
          type: 'attention_node',
          label: firstAttentionNode.name,
          description: firstAttentionNode.description,
        },
      ],
      relationships: [
        {
          from: identity.id,
          to: firstGoal.id,
          type: 'has_goal',
        },
        {
          from: firstGoal.id,
          to: firstAttentionNode.id,
          type: 'has_attention_node',
        },
      ],
    });
  });

  it('returns only the identity node when there are no goals', () => {
    const graph = buildEvolutionGraphProjection({
      identity,
      goals: [],
      attentionNodes: [],
    });

    expect(graph).toEqual({
      nodes: [
        {
          id: identity.id,
          type: 'future_identity',
          label: identity.statement,
          description: identity.purpose,
        },
      ],
      relationships: [],
    });
  });

  it('keeps goals without attention nodes', () => {
    const graph = buildEvolutionGraphProjection({
      identity,
      goals: [firstGoal],
      attentionNodes: [],
    });

    expect(graph.nodes.map((node) => node.id)).toEqual([
      identity.id,
      firstGoal.id,
    ]);
    expect(graph.relationships).toEqual([
      {
        from: identity.id,
        to: firstGoal.id,
        type: 'has_goal',
      },
    ]);
  });

  it('deduplicates attention nodes while preserving all confirmed relationships', () => {
    const sharedAttentionNode = {
      ...firstAttentionNode,
      goalId: secondGoal.id,
    };

    const graph = buildEvolutionGraphProjection({
      identity,
      goals: [firstGoal, secondGoal],
      attentionNodes: [firstAttentionNode, sharedAttentionNode],
    });
    const nodeIds = graph.nodes.map((node) => node.id);

    expect(nodeIds.filter((id) => id === firstAttentionNode.id)).toHaveLength(1);
    expect(graph.relationships).toContainEqual({
      from: firstGoal.id,
      to: firstAttentionNode.id,
      type: 'has_attention_node',
    });
    expect(graph.relationships).toContainEqual({
      from: secondGoal.id,
      to: firstAttentionNode.id,
      type: 'has_attention_node',
    });
  });

  it('returns only relationships that point to present nodes', () => {
    const graph = buildEvolutionGraphProjection({
      identity,
      goals: [firstGoal, secondGoal],
      attentionNodes: [firstAttentionNode, secondAttentionNode],
    });
    const nodeIds = new Set(graph.nodes.map((node) => node.id));

    for (const relationship of graph.relationships) {
      expect(nodeIds.has(relationship.from)).toBe(true);
      expect(nodeIds.has(relationship.to)).toBe(true);
    }
  });

  it('orders identity, goals, attention nodes and relationships deterministically', () => {
    const graph = buildEvolutionGraphProjection({
      identity,
      goals: [secondGoal, firstGoal],
      attentionNodes: [secondAttentionNode, firstAttentionNode],
    });

    expect(graph.nodes.map((node) => node.id)).toEqual([
      identity.id,
      firstGoal.id,
      secondGoal.id,
      firstAttentionNode.id,
      secondAttentionNode.id,
    ]);
    expect(graph.relationships).toEqual([
      {
        from: identity.id,
        to: firstGoal.id,
        type: 'has_goal',
      },
      {
        from: identity.id,
        to: secondGoal.id,
        type: 'has_goal',
      },
      {
        from: firstGoal.id,
        to: firstAttentionNode.id,
        type: 'has_attention_node',
      },
      {
        from: secondGoal.id,
        to: secondAttentionNode.id,
        type: 'has_attention_node',
      },
    ]);
  });
});
