'use client';

import type { FormEventHandler } from 'react';

import { FutureIdentityItem } from '../../lib/future-identity-api';

type CollectionState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: FutureIdentityItem[] };

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type FutureIdentityPanelProps = {
  identityStatement: string;
  identityPurpose: string;
  onStatementChange(value: string): void;
  onPurposeChange(value: string): void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmittingIdentity: boolean;
  identitySubmissionState: SubmissionState;
  futureIdentityState: CollectionState;
  identities: FutureIdentityItem[];
  selectedFutureIdentityId: string | null;
  onSelectIdentity(futureIdentityId: string): void;
};

export function FutureIdentityPanel({
  identityStatement,
  identityPurpose,
  onStatementChange,
  onPurposeChange,
  onSubmit,
  isSubmittingIdentity,
  identitySubmissionState,
  futureIdentityState,
  identities,
  selectedFutureIdentityId,
  onSelectIdentity,
}: FutureIdentityPanelProps) {
  return (
    <div className="grid gap-8">
      <section className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Synapse</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Defini tu direccion, tu transformacion y donde invertir atencion.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Milestone 2B conecta identidades futuras, metas y areas de atencion
            persistidas, sin introducir todavia React Flow ni grafo visual.
          </p>
        </div>

        <form className="mt-8 grid gap-6" onSubmit={onSubmit}>
          <div className="grid gap-3">
            <label className="text-sm font-medium text-white" htmlFor="statement">
              En quien queres convertirte?
            </label>
            <textarea
              id="statement"
              className="min-h-28 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
              placeholder="Software Architect con dominio practico de Cloud e IA"
              value={identityStatement}
              onChange={(event) => onStatementChange(event.target.value)}
              disabled={isSubmittingIdentity}
            />
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium text-white" htmlFor="identity-purpose">
              Por que es importante para vos?
            </label>
            <textarea
              id="identity-purpose"
              className="min-h-40 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
              placeholder="Quiero mantenerme relevante y construir productos propios."
              value={identityPurpose}
              onChange={(event) => onPurposeChange(event.target.value)}
              disabled={isSubmittingIdentity}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmittingIdentity}
            >
              {isSubmittingIdentity ? 'Guardando...' : 'Guardar identidad futura'}
            </button>
            <p className="text-sm text-muted">
              El backend sigue siendo la autoridad sobre las reglas del dominio.
            </p>
          </div>
        </form>

        <div className="mt-6 min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
          {identitySubmissionState.kind === 'idle' &&
            'Selecciona o crea una identidad futura para empezar a registrar metas y areas de atencion.'}
          {identitySubmissionState.kind === 'submitting' &&
            'Persistiendo la identidad futura en PostgreSQL...'}
          {identitySubmissionState.kind === 'success' &&
            identitySubmissionState.message}
          {identitySubmissionState.kind === 'error' &&
            identitySubmissionState.message}
        </div>
      </section>

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
    </div>
  );
}
