import type { Node, NodeProps } from '@xyflow/react';

import { EvolutionGraphFlowNodeData } from '../evolution-graph.mapper';

type AttentionFlowNode = Node<EvolutionGraphFlowNodeData, 'attention_node'>;

export function AttentionNode({
  data,
  selected,
}: NodeProps<AttentionFlowNode>) {
  return (
    <article
      className={`w-[17rem] rounded-[1.35rem] border px-4 py-4 text-left shadow-[0_14px_38px_rgba(0,0,0,0.22)] transition-transform duration-200 ${
        selected
          ? 'border-violet-300/90 bg-slate-950/96 ring-2 ring-violet-300/70'
          : 'border-violet-300/20 bg-slate-950/90 ring-1 ring-white/5'
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/15 text-sm font-semibold uppercase tracking-[0.18em] text-violet-100">
          AN
        </span>
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-violet-200/75">
            Attention Node
          </p>
          <p className="text-xs text-slate-400">Anillo exterior</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold leading-snug text-white">{data.label}</h3>
      {data.description ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">{data.description}</p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sin descripcion adicional.
        </p>
      )}
    </article>
  );
}
