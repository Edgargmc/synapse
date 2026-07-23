'use client';

import { GoalItem } from '../../lib/goal-api';
import { AttentionNodeItem } from '../../lib/attention-node-api';

type AttentionNodeCollectionState =
  | { kind: 'idle' }
  | { kind: 'loading'; goalId: string }
  | { kind: 'error'; goalId: string; message: string }
  | { kind: 'ready'; goalId: string; items: AttentionNodeItem[] };

type AttentionNodePanelProps = {
  selectedGoal: GoalItem | null;
  selectedGoalId: string | null;
  attentionNodes: AttentionNodeItem[];
  attentionNodeCollectionState: AttentionNodeCollectionState;
};

export function AttentionNodePanel({
  selectedGoal,
  selectedGoalId,
  attentionNodes,
  attentionNodeCollectionState,
}: AttentionNodePanelProps) {
  return (
    <section className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
      <div className="border-b border-border pb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Areas de atencion
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {selectedGoal
            ? 'Areas vinculadas a la meta seleccionada'
            : 'Selecciona una meta'}
        </h2>
      </div>

      {!selectedGoal && (
        <div className="mt-6 rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted">
          Cuando selecciones una meta, Synapse cargara unicamente las areas de
          atencion asociadas a esa meta.
        </div>
      )}

      {selectedGoal && (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-background/50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              Meta activa
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {selectedGoal.desiredOutcome}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {selectedGoal.purpose}
            </p>
          </div>

          <p className="mt-6 text-sm text-muted">
            Cada area identifica donde necesitas invertir atencion para avanzar.
          </p>

          <div className="mt-8 grid gap-4">
            {attentionNodeCollectionState.kind === 'loading' &&
              attentionNodeCollectionState.goalId === selectedGoalId && (
                <div className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
                  Cargando areas de atencion de esta meta...
                </div>
              )}

            {attentionNodeCollectionState.kind === 'error' &&
              attentionNodeCollectionState.goalId === selectedGoalId && (
                <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                  {attentionNodeCollectionState.message}
                </div>
              )}

            {attentionNodeCollectionState.kind === 'ready' &&
              attentionNodeCollectionState.goalId === selectedGoalId &&
              attentionNodes.length === 0 && (
                <div className="rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted">
                  Esta meta todavia no tiene areas de atencion asociadas. Cuando
                  guardes la primera, quedara disponible despues de recargar.
                </div>
              )}

            {attentionNodeCollectionState.kind === 'ready' &&
              attentionNodeCollectionState.goalId === selectedGoalId &&
              attentionNodes.map((attentionNode) => (
                <article
                  key={attentionNode.id}
                  className="rounded-2xl border border-border bg-background/60 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-accent">
                    {new Date(attentionNode.createdAt).toLocaleString('es-AR')}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {attentionNode.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {attentionNode.description ??
                      'Sin descripcion adicional. La definicion concreta queda en el nombre.'}
                  </p>
                </article>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
