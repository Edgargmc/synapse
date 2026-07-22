import { UUID_PATTERN, isObject } from './runtime';

export type EvolutionGraphNodeType = 'future_identity' | 'goal' | 'attention_node';
export type EvolutionGraphRelationshipType = 'has_goal' | 'has_attention_node';

export type EvolutionGraphNode = {
  id: string;
  type: EvolutionGraphNodeType;
  label: string;
  description: string | null;
};

export type EvolutionGraphRelationship = {
  from: string;
  to: string;
  type: EvolutionGraphRelationshipType;
};

export type EvolutionGraphResponse = {
  nodes: EvolutionGraphNode[];
  relationships: EvolutionGraphRelationship[];
};

const ALLOWED_NODE_TYPES = new Set<EvolutionGraphNodeType>([
  'future_identity',
  'goal',
  'attention_node',
]);
const ALLOWED_RELATIONSHIP_TYPES = new Set<EvolutionGraphRelationshipType>([
  'has_goal',
  'has_attention_node',
]);

export function validateEvolutionGraphResponse(
  value: unknown,
): EvolutionGraphResponse {
  if (!isObject(value)) {
    throw new Error('La API respondio un grafo invalido.');
  }

  const { nodes, relationships } = value;

  if (!Array.isArray(nodes) || !Array.isArray(relationships)) {
    throw new Error('La API respondio un grafo invalido.');
  }

  const seenNodeIds = new Set<string>();
  const validatedNodes = nodes.map((node) => {
    if (!isObject(node)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    const { id, type, label, description } = node;

    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (seenNodeIds.has(id)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (typeof type !== 'string' || !ALLOWED_NODE_TYPES.has(type as EvolutionGraphNodeType)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (typeof label !== 'string' || label.trim().length === 0) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (description !== null && typeof description !== 'string') {
      throw new Error('La API respondio un grafo invalido.');
    }

    seenNodeIds.add(id);

    return {
      id,
      type: type as EvolutionGraphNodeType,
      label,
      description,
    };
  });

  // Validar que haya exactamente un nodo future_identity
  const futureIdentityNodes = validatedNodes.filter(
    (node) => node.type === 'future_identity'
  );
  if (futureIdentityNodes.length !== 1) {
    throw new Error('El grafo debe contener exactamente una identidad futura.');
  }

  const validatedRelationships = relationships.map((relationship) => {
    if (!isObject(relationship)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    const { from, to, type } = relationship;

    if (typeof from !== 'string' || !UUID_PATTERN.test(from)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (typeof to !== 'string' || !UUID_PATTERN.test(to)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (
      typeof type !== 'string' ||
      !ALLOWED_RELATIONSHIP_TYPES.has(type as EvolutionGraphRelationshipType)
    ) {
      throw new Error('La API respondio un grafo invalido.');
    }

    if (!seenNodeIds.has(from) || !seenNodeIds.has(to)) {
      throw new Error('La API respondio un grafo invalido.');
    }

    return {
      from,
      to,
      type: type as EvolutionGraphRelationshipType,
    };
  });

  return {
    nodes: validatedNodes,
    relationships: validatedRelationships,
  };
}

export function isEvolutionGraphResponse(
  value: unknown,
): value is EvolutionGraphResponse {
  try {
    validateEvolutionGraphResponse(value);
    return true;
  } catch {
    return false;
  }
}
