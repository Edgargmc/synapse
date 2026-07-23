'use client';

import type { FormEventHandler } from 'react';

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type FutureIdentityComposerProps = {
  identityStatement: string;
  identityPurpose: string;
  onStatementChange(value: string): void;
  onPurposeChange(value: string): void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmittingIdentity: boolean;
  identitySubmissionState: SubmissionState;
};

export function FutureIdentityComposer({
  identityStatement,
  identityPurpose,
  onStatementChange,
  onPurposeChange,
  onSubmit,
  isSubmittingIdentity,
  identitySubmissionState,
}: FutureIdentityComposerProps) {
  return (
    <>
      <form className="grid gap-6" onSubmit={onSubmit}>
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

      <div className="min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
        {identitySubmissionState.kind === 'idle' &&
          'Selecciona o crea una identidad futura para empezar a registrar metas y areas de atencion.'}
        {identitySubmissionState.kind === 'submitting' &&
          'Persistiendo la identidad futura en PostgreSQL...'}
        {identitySubmissionState.kind === 'success' && identitySubmissionState.message}
        {identitySubmissionState.kind === 'error' && identitySubmissionState.message}
      </div>
    </>
  );
}
