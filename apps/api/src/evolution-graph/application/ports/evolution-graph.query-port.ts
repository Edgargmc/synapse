export type EvolutionGraphNodeType =
  | 'future_identity'
  | 'goal'
  | 'attention_node';

export type EvolutionGraphRelationshipType =
  | 'has_goal'
  | 'has_attention_node';

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

export type EvolutionGraph = {
  nodes: EvolutionGraphNode[];
  relationships: EvolutionGraphRelationship[];
};

export const EVOLUTION_GRAPH_QUERY_PORT = Symbol(
  'EVOLUTION_GRAPH_QUERY_PORT',
);

export interface EvolutionGraphQueryPort {
  findByFutureIdentityId(futureIdentityId: string): Promise<EvolutionGraph | null>;
}
