'use client';

import type { FormEventHandler } from 'react';

import { GoalItem } from '../../lib/goal-api';
import { AttentionNodeItem } from '../../lib/attention-node-api';

type AttentionNodeCollectionState =
  | { kind: 'idle' }
  | { kind: 'loading'; goalId: string }
  | { kind: 'error'; goalId: string; message: string }
  | { kind: 'ready'; goalId: string; items: AttentionNodeItem[] };

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type AttentionNodePanelProps = {
  selectedGoal: GoalItem | null;
  selectedGoalId: string | null;
  attentionNodes: AttentionNodeItem[];
  attentionNodeCollectionState: AttentionNodeCollectionState;
  isAttentionNodeComposerOpen: boolean;
  onToggleAttentionNodeComposer(): void;
  attentionNodeName: string;
  attentionNodeDescription: string;
  onAttentionNodeNameChange(value: string): void;
  onAttentionNodeDescriptionChange(value: string): void;
  onAttentionNodeSubmit: FormEventHandler<HTMLFormElement>;
  isSubmittingAttentionNode: boolean;
  attentionNodeSubmissionState: SubmissionState;
};

export function AttentionNodePanel({
  selectedGoal,
  selectedGoalId,
  attentionNodes,
  attentionNodeCollectionState,
  isAttentionNodeComposerOpen,
  onToggleAttentionNodeComposer,
  attentionNodeName,
  attentionNodeDescription,
  onAttentionNodeNameChange,
  onAttentionNodeDescriptionChange,
  onAttentionNodeSubmit,
  isSubmittingAttentionNode,
  attentionNodeSubmissionState,
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

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-full border border-accent/40 bg-accentSoft px-5 py-3 text-sm font-semibold text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onToggleAttentionNodeComposer}
              disabled={!selectedGoal}
            >
              {isAttentionNodeComposerOpen
                ? 'Cerrar agregar area de atencion'
                : 'Agregar area de atencion'}
            </button>
            <p className="text-sm text-muted">
              Cada area identifica donde necesitas invertir atencion para avanzar.
            </p>
          </div>

          {isAttentionNodeComposerOpen && (
            <form className="mt-6 grid gap-6" onSubmit={onAttentionNodeSubmit}>
              <div className="grid gap-3">
                <label className="text-sm font-medium text-white" htmlFor="attention-node-name">
                  Donde necesitas invertir atencion para avanzar?
                </label>
                <textarea
                  id="attention-node-name"
                  className="min-h-24 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
                  placeholder="Arquitectura de software"
                  value={attentionNodeName}
                  onChange={(event) => onAttentionNodeNameChange(event.target.value)}
                  disabled={isSubmittingAttentionNode}
                  required
                  maxLength={100}
                />
                <p className="text-xs text-muted">{attentionNodeName.length}/100 caracteres</p>
              </div>

              <div className="grid gap-3">
                <label
                  className="text-sm font-medium text-white"
                  htmlFor="attention-node-description"
                >
                  Que representa esta area para vos?
                </label>
                <textarea
                  id="attention-node-description"
                  className="min-h-36 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
                  placeholder="Capacidad para tomar y justificar decisiones estructurales en sistemas reales."
                  value={attentionNodeDescription}
                  onChange={(event) =>
                    onAttentionNodeDescriptionChange(event.target.value)
                  }
                  disabled={isSubmittingAttentionNode}
                  maxLength={1000}
                />
                <p className="text-xs text-muted">
                  {attentionNodeDescription.length}/1000 caracteres
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmittingAttentionNode}
                >
                  {isSubmittingAttentionNode ? 'Guardando...' : 'Guardar area de atencion'}
                </button>
                <p className="text-sm text-muted">
                  El nodo se creara y se vinculara automaticamente con la meta.
                </p>
              </div>
            </form>
          )}

          <div className="mt-6 min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
            {attentionNodeSubmissionState.kind === 'idle' &&
              'Abre el formulario para registrar donde necesitas invertir atencion para avanzar.'}
            {attentionNodeSubmissionState.kind === 'submitting' &&
              'Persistiendo el nodo y su vinculo con la meta en PostgreSQL...'}
            {attentionNodeSubmissionState.kind === 'success' &&
              attentionNodeSubmissionState.message}
            {attentionNodeSubmissionState.kind === 'error' &&
              attentionNodeSubmissionState.message}
          </div>

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
