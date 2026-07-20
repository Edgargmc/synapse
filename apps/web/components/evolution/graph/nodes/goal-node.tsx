import type { Node, NodeProps } from '@xyflow/react';

import { EvolutionGraphFlowNodeData } from '../evolution-graph.mapper';

type GoalFlowNode = Node<EvolutionGraphFlowNodeData, 'goal'>;

export function GoalNode({ data, selected }: NodeProps<GoalFlowNode>) {
  return (
    <article
      className={`w-[19rem] rounded-[1.6rem] border px-4 py-4 text-left shadow-[0_16px_42px_rgba(0,0,0,0.24)] transition-transform duration-200 ${
        selected
          ? 'border-emerald-300/90 bg-slate-950/96 ring-2 ring-emerald-300/70'
          : 'border-emerald-300/20 bg-slate-950/90 ring-1 ring-white/5'
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/15 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
          GO
        </span>
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-emerald-200/75">
            Goal
          </p>
          <p className="text-xs text-slate-400">Primer anillo</p>
        </div>
      </div>

      <h3 className="text-base font-semibold leading-snug text-white">{data.label}</h3>
      {data.description ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">{data.description}</p>
      ) : null}
    </article>
  );
}
