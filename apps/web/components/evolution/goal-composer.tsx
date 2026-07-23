'use client';

import type { FormEventHandler } from 'react';

import { FutureIdentityItem } from '../../lib/future-identity-api';

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type GoalComposerProps = {
  selectedIdentity: FutureIdentityItem;
  goalDesiredOutcome: string;
  goalPurpose: string;
  onGoalDesiredOutcomeChange(value: string): void;
  onGoalPurposeChange(value: string): void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmittingGoal: boolean;
  goalSubmissionState: SubmissionState;
};

export function GoalComposer({
  selectedIdentity,
  goalDesiredOutcome,
  goalPurpose,
  onGoalDesiredOutcomeChange,
  onGoalPurposeChange,
  onSubmit,
  isSubmittingGoal,
  goalSubmissionState,
}: GoalComposerProps) {
  return (
    <>
      <form className="grid gap-6" onSubmit={onSubmit}>
        <div className="grid gap-3">
          <label
            className="text-sm font-medium text-white"
            htmlFor="goal-desired-outcome"
          >
            Que cambio concreto queres observar en vos?
          </label>
          <textarea
            id="goal-desired-outcome"
            className="min-h-32 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
            placeholder="Ser capaz de disenar, construir y explicar un producto real con IA aplicada."
            value={goalDesiredOutcome}
            onChange={(event) => onGoalDesiredOutcomeChange(event.target.value)}
            disabled={isSubmittingGoal}
            required
            maxLength={300}
          />
          <p className="text-xs text-muted">
            {goalDesiredOutcome.length}/300 caracteres
          </p>
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium text-white" htmlFor="goal-purpose">
            Por que esta transformacion es importante?
          </label>
          <textarea
            id="goal-purpose"
            className="min-h-40 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
            placeholder="Convertir conocimiento teorico en experiencia practica demostrable."
            value={goalPurpose}
            onChange={(event) => onGoalPurposeChange(event.target.value)}
            disabled={isSubmittingGoal}
            required
            maxLength={2000}
          />
          <p className="text-xs text-muted">{goalPurpose.length}/2000 caracteres</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmittingGoal}
          >
            {isSubmittingGoal ? 'Guardando...' : 'Guardar meta'}
          </button>
          <p className="text-sm text-muted">
            La meta quedara asociada a la identidad seleccionada: {selectedIdentity.statement}.
          </p>
        </div>
      </form>

      <div className="min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
        {goalSubmissionState.kind === 'idle' &&
          'Abre el formulario para registrar una transformacion concreta para esta identidad.'}
        {goalSubmissionState.kind === 'submitting' &&
          'Persistiendo la meta vinculada en PostgreSQL...'}
        {goalSubmissionState.kind === 'success' && goalSubmissionState.message}
        {goalSubmissionState.kind === 'error' && goalSubmissionState.message}
      </div>
    </>
  );
}
