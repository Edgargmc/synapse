'use client';

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { useEffect, useMemo } from 'react';

import {
  EvolutionGraphNodeType,
  EvolutionGraphResponse,
} from '../../../lib/evolution-graph-api';
import {
  mapEvolutionGraphToFlowElements,
  type EvolutionGraphFlowNodeData,
} from './evolution-graph.mapper';
import { buildRadialLayout } from './radial-layout';
import { AttentionNode } from './nodes/attention-node';
import { FutureIdentityNode } from './nodes/future-identity-node';
import { GoalNode } from './nodes/goal-node';

export type EvolutionGraphState =
  | { kind: 'idle' }
  | { kind: 'loading'; futureIdentityId: string }
  | { kind: 'error'; futureIdentityId: string; message: string }
  | {
      kind: 'ready';
      futureIdentityId: string;
      graph: EvolutionGraphResponse;
    };

export type EvolutionGraphSelection = {
  id: string;
  label: string;
  description: string | null;
  kind: EvolutionGraphNodeType;
};

const nodeTypes: NodeTypes = {
  future_identity: FutureIdentityNode,
  goal: GoalNode,
  attention_node: AttentionNode,
};

type EvolutionGraphCanvasProps = {
  graphState: EvolutionGraphState;
  onNodeSelectionChange: (selection: EvolutionGraphSelection | null) => void;
};

export function EvolutionGraphCanvas({
  graphState,
  onNodeSelectionChange,
}: EvolutionGraphCanvasProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,34,0.96),rgba(4,8,22,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
      <div className="px-6 pb-6 pt-5">
        {graphState.kind === 'idle' ? (
          <CanvasMessage
            title="Todavia no hay identidad seleccionada"
            message="Selecciona una identidad futura para proyectar su mapa visual."
          />
        ) : null}

        {graphState.kind === 'loading' ? (
          <CanvasMessage
            title="Cargando mapa visual"
            message="Consultando la proyeccion actual de la identidad seleccionada."
            isLoading
          />
        ) : null}

        {graphState.kind === 'error' ? (
          <CanvasMessage
            title="No se pudo cargar el grafo"
            message={graphState.message}
          />
        ) : null}

        {graphState.kind === 'ready' ? (
          <GraphReadyState
            graph={graphState.graph}
            onNodeSelectionChange={onNodeSelectionChange}
          />
        ) : null}
      </div>
    </div>
  );
}

function GraphReadyState({
  graph,
  onNodeSelectionChange,
}: {
  graph: EvolutionGraphResponse;
  onNodeSelectionChange: (selection: EvolutionGraphSelection | null) => void;
}) {
  const positions = useMemo(() => buildRadialLayout(graph), [graph]);
  const { nodes, edges } = useMemo(
    () => mapEvolutionGraphToFlowElements(graph, positions),
    [graph, positions],
  );
  const graphKey = useMemo(
    () =>
      `${graph.nodes.map((node) => node.id).join('|')}::${graph.relationships
        .map((relationship) => `${relationship.type}:${relationship.from}->${relationship.to}`)
        .join('|')}`,
    [graph],
  );
  const hasGoals = graph.nodes.some((node) => node.type === 'goal');

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1">
          Identidad central
        </span>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1">
          Goals en primer anillo
        </span>
        <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1">
          Attention Nodes en anillo exterior
        </span>
        {!hasGoals ? (
          <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-amber-100">
            La identidad aun no tiene goals
          </span>
        ) : null}
      </div>

      <div className="h-[56vh] min-h-[480px] lg:min-h-[620px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(48,80,160,0.18),transparent_35%),linear-gradient(180deg,rgba(5,8,20,0.82),rgba(2,4,12,0.98))]">
        <ReactFlowProvider>
          <GraphViewport
            graphKey={graphKey}
            nodes={nodes}
            edges={edges}
            onNodeSelectionChange={onNodeSelectionChange}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

function GraphViewport({
  graphKey,
  nodes,
  edges,
  onNodeSelectionChange,
}: {
  graphKey: string;
  nodes: Array<Node<EvolutionGraphFlowNodeData>>;
  edges: Edge[];
  onNodeSelectionChange: (selection: EvolutionGraphSelection | null) => void;
}) {
  const { fitView } = useReactFlow();
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);

  useEffect(() => {
    setNodesState(nodes);
  }, [nodes, setNodesState]);

  useEffect(() => {
    void fitView({
      padding: 0.2,
      duration: prefersReducedMotion ? 0 : 280,
      maxZoom: 1.3,
    });
  }, [fitView, graphKey, prefersReducedMotion]);

  return (
    <ReactFlow
      nodes={nodesState}
      edges={edges}
      nodeTypes={nodeTypes}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      deleteKeyCode={null}
      edgesReconnectable={false}
      fitView
      fitViewOptions={{
        padding: 0.2,
        duration: prefersReducedMotion ? 0 : 280,
        maxZoom: 1.3,
      }}
      colorMode="dark"
      minZoom={0.3}
      maxZoom={1.8}
      onNodesChange={onNodesChange}
      onNodeClick={(_, node) => {
        onNodeSelectionChange({
          id: node.id,
          label: node.data.label,
          description: node.data.description,
          kind: node.data.kind,
        });
      }}
      onPaneClick={() => onNodeSelectionChange(null)}
    >
      <Background color="rgba(124, 156, 255, 0.18)" gap={22} size={1.2} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function CanvasMessage({
  title,
  message,
  isLoading = false,
}: {
  title: string;
  message: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
      <div
        className={`mb-5 h-14 w-14 rounded-full border border-sky-300/30 bg-sky-400/10 ${
          isLoading
            ? 'motion-safe:animate-spin motion-reduce:animate-none'
            : 'motion-safe:animate-pulse motion-reduce:animate-none'
        }`}
      />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{message}</p>
    </div>
  );
}
