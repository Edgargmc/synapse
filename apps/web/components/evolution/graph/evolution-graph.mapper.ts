import type { Edge, Node } from '@xyflow/react';

import {
  EvolutionGraphNodeType,
  EvolutionGraphResponse,
} from '../../../lib/evolution-graph-api';
import { GraphPosition } from './radial-layout';

export type EvolutionGraphFlowNodeData = {
  label: string;
  description: string | null;
  kind: EvolutionGraphNodeType;
};

export function mapEvolutionGraphToFlowElements(
  graph: EvolutionGraphResponse,
  positions: Map<string, GraphPosition>,
): {
  nodes: Array<Node<EvolutionGraphFlowNodeData>>;
  edges: Edge[];
} {
  const nodes = graph.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: {
      label: node.label,
      description: node.description,
      kind: node.type,
    },
    draggable: true,
    selectable: true,
  }));

  const edges = [...graph.relationships]
    .map((relationship) => ({
      id: createEdgeId(relationship.type, relationship.from, relationship.to),
      source: relationship.from,
      target: relationship.to,
      selectable: true,
      animated: false,
      style:
        relationship.type === 'has_goal'
          ? {
              stroke: 'rgba(124, 156, 255, 0.82)',
              strokeWidth: 2.2,
            }
          : {
              stroke: 'rgba(145, 255, 210, 0.78)',
              strokeWidth: 1.9,
            },
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

  return { nodes, edges };
}

function createEdgeId(type: string, from: string, to: string) {
  return `${type}:${from}->${to}`;
}
