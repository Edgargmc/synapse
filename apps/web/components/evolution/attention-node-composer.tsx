'use client';

import type { FormEventHandler } from 'react';

import { GoalItem } from '../../lib/goal-api';

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type AttentionNodeComposerProps = {
  selectedGoal: GoalItem;
  attentionNodeName: string;
  attentionNodeDescription: string;
  onAttentionNodeNameChange(value: string): void;
  onAttentionNodeDescriptionChange(value: string): void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmittingAttentionNode: boolean;
  attentionNodeSubmissionState: SubmissionState;
};

export function AttentionNodeComposer({
  selectedGoal,
  attentionNodeName,
  attentionNodeDescription,
  onAttentionNodeNameChange,
  onAttentionNodeDescriptionChange,
  onSubmit,
  isSubmittingAttentionNode,
  attentionNodeSubmissionState,
}: AttentionNodeComposerProps) {
  return (
    <>
      <form className="grid gap-6" onSubmit={onSubmit}>
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
            onChange={(event) => onAttentionNodeDescriptionChange(event.target.value)}
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
            {isSubmittingAttentionNode ? 'Guardando...' : 'Guardar área de atención'}
          </button>
          <p className="text-sm text-muted">
            El nodo se creara y se vinculara automaticamente con la meta activa:{' '}
            {selectedGoal.desiredOutcome}.
          </p>
        </div>
      </form>

      <div className="min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
        {attentionNodeSubmissionState.kind === 'idle' &&
          'Abre el formulario para registrar donde necesitas invertir atencion para avanzar.'}
        {attentionNodeSubmissionState.kind === 'submitting' &&
          'Persistiendo el nodo y su vinculo con la meta en PostgreSQL...'}
        {attentionNodeSubmissionState.kind === 'success' &&
          attentionNodeSubmissionState.message}
        {attentionNodeSubmissionState.kind === 'error' &&
          attentionNodeSubmissionState.message}
      </div>
    </>
  );
}
