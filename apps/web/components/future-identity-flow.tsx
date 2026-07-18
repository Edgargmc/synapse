'use client';

import { FormEvent, useEffect, useState } from 'react';

import {
  ApiErrorResponse,
  FutureIdentityItem,
  isApiErrorResponse,
  isFutureIdentityItem,
  isFutureIdentityListResponse,
} from '../lib/future-identity-api';

type CollectionState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: FutureIdentityItem[] };

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function FutureIdentityFlow() {
  const [statement, setStatement] = useState('');
  const [purpose, setPurpose] = useState('');
  const [collectionState, setCollectionState] = useState<CollectionState>({
    kind: 'loading',
  });
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>({ kind: 'idle' });

  useEffect(() => {
    void loadFutureIdentities();
  }, []);

  async function loadFutureIdentities() {
    if (!API_BASE_URL) {
      setCollectionState({
        kind: 'error',
        message:
          'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    setCollectionState({ kind: 'loading' });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/future-identities`, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });
    } catch {
      setCollectionState({
        kind: 'error',
        message:
          'No se pudo consultar la coleccion. Verifica que la API este iniciada.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
      setCollectionState({
        kind: 'error',
        message: getApiErrorMessage(payload, 'No se pudo cargar la coleccion.'),
      });
      return;
    }

    if (!isFutureIdentityListResponse(payload)) {
      setCollectionState({
        kind: 'error',
        message: 'La API respondio un contrato invalido para la coleccion.',
      });
      return;
    }

    setCollectionState({ kind: 'ready', items: payload.items });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!API_BASE_URL) {
      setSubmissionState({
        kind: 'error',
        message:
          'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    setSubmissionState({ kind: 'submitting' });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/future-identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ statement, purpose }),
      });
    } catch {
      setSubmissionState({
        kind: 'error',
        message:
          'No se pudo conectar con la API. Verifica que el backend este iniciado.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
      setSubmissionState({
        kind: 'error',
        message: getApiErrorMessage(payload, 'No se pudo guardar la identidad futura.'),
      });
      return;
    }

    if (!isFutureIdentityItem(payload)) {
      setSubmissionState({
        kind: 'error',
        message: 'La API respondio un contrato invalido al guardar la identidad.',
      });
      return;
    }

    setStatement('');
    setPurpose('');
    await loadFutureIdentities();
    setSubmissionState({
      kind: 'success',
      message: 'La identidad futura se guardo correctamente.',
    });
  }

  const identities = collectionState.kind === 'ready' ? collectionState.items : [];
  const isSubmitting = submissionState.kind === 'submitting';

  return (
    <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Synapse</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            En quien queres convertirte?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Defini una identidad futura clara y el motivo que le da sentido. Este es el
            primer corte vertical de negocio de Synapse.
          </p>
        </div>

        <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <label className="text-sm font-medium text-white" htmlFor="statement">
              En quien queres convertirte?
            </label>
            <textarea
              id="statement"
              className="min-h-28 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
              placeholder="Software Architect con dominio practico de Cloud e IA"
              value={statement}
              onChange={(event) => setStatement(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium text-white" htmlFor="purpose">
              Por que es importante para vos?
            </label>
            <textarea
              id="purpose"
              className="min-h-40 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
              placeholder="Quiero mantenerme relevante y construir productos propios."
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar identidad futura'}
            </button>
            <p className="text-sm text-muted">
              El backend sigue siendo la autoridad sobre las reglas del dominio.
            </p>
          </div>
        </form>

        <div className="mt-6 min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
          {submissionState.kind === 'idle' &&
            'Todavia no guardaste una identidad futura en esta sesion.'}
          {submissionState.kind === 'submitting' &&
            'Persistiendo la identidad futura en PostgreSQL...'}
          {submissionState.kind === 'success' && submissionState.message}
          {submissionState.kind === 'error' && submissionState.message}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-panel/80 p-8 shadow-panel backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">
              Identidades futuras
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Persistidas en PostgreSQL
            </h2>
          </div>
          <div className="rounded-full border border-accent/40 bg-accentSoft px-4 py-2 text-xs uppercase tracking-[0.2em] text-accent">
            Milestone 1
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {collectionState.kind === 'loading' && (
            <div className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
              Cargando identidades futuras...
            </div>
          )}

          {collectionState.kind === 'error' && (
            <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
              {collectionState.message}
            </div>
          )}

          {collectionState.kind === 'ready' && identities.length === 0 && (
            <div className="rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted">
              Todavia no hay identidades futuras persistidas. Cuando guardes la primera,
              aparecera aqui y seguira disponible despues de recargar.
            </div>
          )}

          {collectionState.kind === 'ready' &&
            identities.map((identity) => (
              <article
                key={identity.id}
                className="rounded-2xl border border-border bg-background/60 p-5"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-accent">
                  {new Date(identity.createdAt).toLocaleString('es-AR')}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {identity.statement}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">{identity.purpose}</p>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (isApiErrorResponse(payload)) {
    return payload.error.message;
  }

  return fallback;
}
