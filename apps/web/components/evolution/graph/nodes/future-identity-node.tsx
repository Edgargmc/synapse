import type { Node, NodeProps } from '@xyflow/react';

import { EvolutionGraphFlowNodeData } from '../evolution-graph.mapper';

type FutureIdentityFlowNode = Node<EvolutionGraphFlowNodeData, 'future_identity'>;

export function FutureIdentityNode({
  data,
  selected,
}: NodeProps<FutureIdentityFlowNode>) {
  return (
    <article
      className={`w-[23rem] rounded-[2rem] border px-5 py-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-transform duration-200 ${
        selected
          ? 'border-sky-300/90 bg-slate-950/96 ring-2 ring-sky-300/80'
          : 'border-sky-400/25 bg-slate-950/90 ring-1 ring-white/5'
      }`}
    >
      <div className="motion-safe:animate-[pulse_3.6s_ease-in-out_infinite] motion-reduce:animate-none">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-300/40 bg-sky-400/15 text-sm font-semibold uppercase tracking-[0.24em] text-sky-100 shadow-[0_0_35px_rgba(96,165,250,0.35)]">
            FI
          </span>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-sky-200/70">
              Future Identity
            </p>
            <p className="text-xs text-slate-400">Centro de direccion actual</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold leading-snug text-white">{data.label}</h3>
        {data.description ? (
          <p className="mt-3 text-sm leading-6 text-slate-300">{data.description}</p>
        ) : null}
      </div>
    </article>
  );
}
