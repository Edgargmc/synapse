'use client';

import type { FormEventHandler } from 'react';

import { FutureIdentityItem } from '../../lib/future-identity-api';
import { GoalItem } from '../../lib/goal-api';

type GoalCollectionState =
  | { kind: 'idle' }
  | { kind: 'loading'; futureIdentityId: string }
  | { kind: 'error'; futureIdentityId: string; message: string }
  | { kind: 'ready'; futureIdentityId: string; items: GoalItem[] };

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type GoalPanelProps = {
  selectedIdentity: FutureIdentityItem | null;
  selectedFutureIdentityId: string | null;
  selectedGoalId: string | null;
  selectedGoals: GoalItem[];
  goalCollectionState: GoalCollectionState;
  isGoalComposerOpen: boolean;
  onToggleGoalComposer(): void;
  goalDesiredOutcome: string;
  goalPurpose: string;
  onGoalDesiredOutcomeChange(value: string): void;
  onGoalPurposeChange(value: string): void;
  onGoalSubmit: FormEventHandler<HTMLFormElement>;
  isSubmittingGoal: boolean;
  goalSubmissionState: SubmissionState;
  onSelectGoal(goalId: string): void;
};

export function GoalPanel({
  selectedIdentity,
  selectedFutureIdentityId,
  selectedGoalId,
  selectedGoals,
  goalCollectionState,
  isGoalComposerOpen,
  onToggleGoalComposer,
  goalDesiredOutcome,
  goalPurpose,
  onGoalDesiredOutcomeChange,
  onGoalPurposeChange,
  onGoalSubmit,
  isSubmittingGoal,
  goalSubmissionState,
  onSelectGoal,
}: GoalPanelProps) {
  return (
    <section className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
      <div className="border-b border-border pb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Metas vinculadas
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {selectedIdentity
            ? 'Selecciona una meta para ver sus areas de atencion'
            : 'Selecciona una identidad futura'}
        </h2>
      </div>

      {!selectedIdentity && (
        <div className="mt-6 rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted">
          Cuando selecciones una identidad futura, Synapse cargara unicamente las
          metas asociadas a esa identidad.
        </div>
      )}

      {selectedIdentity && (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-background/50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              Identidad activa
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {selectedIdentity.statement}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {selectedIdentity.purpose}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-full border border-accent/40 bg-accentSoft px-5 py-3 text-sm font-semibold text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onToggleGoalComposer}
              disabled={!selectedIdentity}
            >
              {isGoalComposerOpen
                ? 'Cerrar agregar transformacion'
                : 'Agregar transformacion'}
            </button>
            <p className="text-sm text-muted">
              Las metas representan cambios concretos, no tareas.
            </p>
          </div>

          {isGoalComposerOpen && (
            <form className="mt-6 grid gap-6" onSubmit={onGoalSubmit}>
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
                  La meta quedara asociada a la identidad seleccionada.
                </p>
              </div>
            </form>
          )}

          <div className="mt-6 min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
            {goalSubmissionState.kind === 'idle' &&
              'Abre el formulario para registrar una transformacion concreta para esta identidad.'}
            {goalSubmissionState.kind === 'submitting' &&
              'Persistiendo la meta vinculada en PostgreSQL...'}
            {goalSubmissionState.kind === 'success' && goalSubmissionState.message}
            {goalSubmissionState.kind === 'error' && goalSubmissionState.message}
          </div>

          <div className="mt-8 grid gap-4">
            {goalCollectionState.kind === 'loading' &&
              goalCollectionState.futureIdentityId === selectedFutureIdentityId && (
                <div className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
                  Cargando metas de esta identidad...
                </div>
              )}

            {goalCollectionState.kind === 'error' &&
              goalCollectionState.futureIdentityId === selectedFutureIdentityId && (
                <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                  {goalCollectionState.message}
                </div>
              )}

            {goalCollectionState.kind === 'ready' &&
              goalCollectionState.futureIdentityId === selectedFutureIdentityId &&
              selectedGoals.length === 0 && (
                <div className="rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted">
                  Esta identidad todavia no tiene metas asociadas. Cuando guardes la
                  primera, quedara disponible despues de recargar.
                </div>
              )}

            {goalCollectionState.kind === 'ready' &&
              goalCollectionState.futureIdentityId === selectedFutureIdentityId &&
              selectedGoals.map((goal) => {
                const isSelected = goal.id === selectedGoalId;

                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => onSelectGoal(goal.id)}
                    className={[
                      'rounded-2xl border p-5 text-left transition',
                      isSelected
                        ? 'border-accent bg-accentSoft/70 shadow-glow'
                        : 'border-border bg-background/60 hover:border-accent/40',
                    ].join(' ')}
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-accent">
                      {isSelected ? 'Meta seleccionada' : 'Seleccionar meta'}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-accent">
                      {new Date(goal.createdAt).toLocaleString('es-AR')}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {goal.desiredOutcome}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{goal.purpose}</p>
                  </button>
                );
              })}
          </div>
        </>
      )}
    </section>
  );
}
