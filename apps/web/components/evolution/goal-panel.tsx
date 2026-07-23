'use client';

import { FutureIdentityItem } from '../../lib/future-identity-api';
import { GoalItem } from '../../lib/goal-api';

type GoalCollectionState =
  | { kind: 'idle' }
  | { kind: 'loading'; futureIdentityId: string }
  | { kind: 'error'; futureIdentityId: string; message: string }
  | { kind: 'ready'; futureIdentityId: string; items: GoalItem[] };

type GoalPanelProps = {
  selectedIdentity: FutureIdentityItem | null;
  selectedFutureIdentityId: string | null;
  selectedGoalId: string | null;
  selectedGoals: GoalItem[];
  goalCollectionState: GoalCollectionState;
  onSelectGoal(goalId: string): void;
};

export function GoalPanel({
  selectedIdentity,
  selectedFutureIdentityId,
  selectedGoalId,
  selectedGoals,
  goalCollectionState,
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

          <p className="mt-6 text-sm text-muted">
            Las metas representan cambios concretos, no tareas.
          </p>

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
