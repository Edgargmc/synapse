'use client';

import { FutureIdentityItem } from '../../lib/future-identity-api';

type CollectionState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: FutureIdentityItem[] };

type FutureIdentityPanelProps = {
  futureIdentityState: CollectionState;
  identities: FutureIdentityItem[];
  selectedFutureIdentityId: string | null;
  onSelectIdentity(futureIdentityId: string): void;
};

export function FutureIdentityPanel({
  futureIdentityState,
  identities,
  selectedFutureIdentityId,
  onSelectIdentity,
}: FutureIdentityPanelProps) {
  return (
    <section className="rounded-3xl border border-border bg-panel/80 p-8 shadow-panel backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">
              Identidades futuras
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Selecciona una identidad para ver sus metas
            </h2>
          </div>
          <div className="rounded-full border border-accent/40 bg-accentSoft px-4 py-2 text-xs uppercase tracking-[0.2em] text-accent">
            Milestone 2B
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {futureIdentityState.kind === 'loading' && (
            <div className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
              Cargando identidades futuras...
            </div>
          )}

          {futureIdentityState.kind === 'error' && (
            <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
              {futureIdentityState.message}
            </div>
          )}

          {futureIdentityState.kind === 'ready' && identities.length === 0 && (
            <div className="rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted">
              Todavia no hay identidades futuras persistidas. Crea la primera para
              empezar a asociarle metas y areas de atencion.
            </div>
          )}

          {futureIdentityState.kind === 'ready' &&
            identities.map((identity) => {
              const isSelected = identity.id === selectedFutureIdentityId;

              return (
                <button
                  key={identity.id}
                  type="button"
                  onClick={() => onSelectIdentity(identity.id)}
                  className={[
                    'rounded-2xl border p-5 text-left transition',
                    isSelected
                      ? 'border-accent bg-accentSoft/70 shadow-glow'
                      : 'border-border bg-background/60 hover:border-accent/40',
                  ].join(' ')}
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-accent">
                    {isSelected ? 'Seleccionada' : 'Seleccionar identidad'}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {identity.statement}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {identity.purpose}
                  </p>
                </button>
              );
            })}
        </div>
    </section>
  );
}
