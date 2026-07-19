'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { GoalItem, isGoalItem, isGoalListResponse } from '../lib/goal-api';
import {
  FutureIdentityItem,
  isApiErrorResponse,
  isFutureIdentityItem,
  isFutureIdentityListResponse,
} from '../lib/future-identity-api';

type CollectionState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: FutureIdentityItem[] };

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function FutureIdentityFlow() {
  const [identityStatement, setIdentityStatement] = useState('');
  const [identityPurpose, setIdentityPurpose] = useState('');
  const [futureIdentityState, setFutureIdentityState] =
    useState<CollectionState>({ kind: 'loading' });
  const [identitySubmissionState, setIdentitySubmissionState] =
    useState<SubmissionState>({ kind: 'idle' });
  const [selectedFutureIdentityId, setSelectedFutureIdentityId] = useState<
    string | null
  >(null);
  const [goalDesiredOutcome, setGoalDesiredOutcome] = useState('');
  const [goalPurpose, setGoalPurpose] = useState('');
  const [goalCollectionState, setGoalCollectionState] =
    useState<GoalCollectionState>({ kind: 'idle' });
  const [goalSubmissionState, setGoalSubmissionState] =
    useState<SubmissionState>({ kind: 'idle' });
  const [isGoalComposerOpen, setIsGoalComposerOpen] = useState(false);
  const latestGoalRequestId = useRef(0);

  const identities = futureIdentityState.kind === 'ready' ? futureIdentityState.items : [];
  const selectedIdentity =
    identities.find((identity) => identity.id === selectedFutureIdentityId) ?? null;
  const selectedGoals =
    goalCollectionState.kind === 'ready' &&
    goalCollectionState.futureIdentityId === selectedFutureIdentityId
      ? goalCollectionState.items
      : [];
  const isSubmittingIdentity = identitySubmissionState.kind === 'submitting';
  const isSubmittingGoal = goalSubmissionState.kind === 'submitting';

  const syncSelectedFutureIdentity = useCallback(
    (items: FutureIdentityItem[], preferredSelectionId?: string) => {
      setSelectedFutureIdentityId((currentSelection) => {
        if (items.length === 0) {
          setGoalDesiredOutcome('');
          setGoalPurpose('');
          setGoalSubmissionState({ kind: 'idle' });
          return null;
        }

        if (
          preferredSelectionId &&
          items.some((identity) => identity.id === preferredSelectionId)
        ) {
          return preferredSelectionId;
        }

        if (
          currentSelection &&
          items.some((identity) => identity.id === currentSelection)
        ) {
          return currentSelection;
        }

        return items[0].id;
      });
    },
    [],
  );

  const loadFutureIdentities = useCallback(async (preferredSelectionId?: string) => {
    if (!API_BASE_URL) {
      setFutureIdentityState({
        kind: 'error',
        message: 'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    setFutureIdentityState({ kind: 'loading' });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/future-identities`, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });
    } catch {
      setFutureIdentityState({
        kind: 'error',
        message: 'No se pudo consultar la coleccion. Verifica que la API este iniciada.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
      setFutureIdentityState({
        kind: 'error',
        message: getApiErrorMessage(payload, 'No se pudo cargar la coleccion.'),
      });
      return;
    }

    if (!isFutureIdentityListResponse(payload)) {
      setFutureIdentityState({
        kind: 'error',
        message: 'La API respondio un contrato invalido para la coleccion.',
      });
      return;
    }

    setFutureIdentityState({ kind: 'ready', items: payload.items });
    syncSelectedFutureIdentity(payload.items, preferredSelectionId);
  }, [syncSelectedFutureIdentity]);

  const loadGoals = useCallback(async (futureIdentityId: string) => {
    if (!API_BASE_URL) {
      setGoalCollectionState({
        kind: 'error',
        futureIdentityId,
        message: 'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    const requestId = latestGoalRequestId.current + 1;
    latestGoalRequestId.current = requestId;
    setGoalCollectionState({ kind: 'loading', futureIdentityId });

    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/future-identities/${futureIdentityId}/goals`,
        {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      );
    } catch {
      if (requestId !== latestGoalRequestId.current) {
        return;
      }

      setGoalCollectionState({
        kind: 'error',
        futureIdentityId,
        message: 'No se pudo consultar las transformaciones de esta identidad.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (requestId !== latestGoalRequestId.current) {
      return;
    }

    if (!response.ok) {
      setGoalCollectionState({
        kind: 'error',
        futureIdentityId,
        message: getApiErrorMessage(
          payload,
          'No se pudieron cargar las transformaciones de esta identidad.',
        ),
      });
      return;
    }

    if (!isGoalListResponse(payload)) {
      setGoalCollectionState({
        kind: 'error',
        futureIdentityId,
        message: 'La API respondio un contrato invalido para las metas.',
      });
      return;
    }

    setGoalCollectionState({ kind: 'ready', futureIdentityId, items: payload.items });
  }, []);

  useEffect(() => {
    void loadFutureIdentities();
  }, [loadFutureIdentities]);

  useEffect(() => {
    if (!selectedFutureIdentityId) {
      latestGoalRequestId.current += 1;
      setGoalCollectionState({ kind: 'idle' });
      setIsGoalComposerOpen(false);
      return;
    }

    void loadGoals(selectedFutureIdentityId);
  }, [loadGoals, selectedFutureIdentityId]);

  async function handleFutureIdentitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!API_BASE_URL) {
      setIdentitySubmissionState({
        kind: 'error',
        message: 'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    setIdentitySubmissionState({ kind: 'submitting' });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/future-identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          statement: identityStatement,
          purpose: identityPurpose,
        }),
      });
    } catch {
      setIdentitySubmissionState({
        kind: 'error',
        message: 'No se pudo conectar con la API. Verifica que el backend este iniciado.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
      setIdentitySubmissionState({
        kind: 'error',
        message: getApiErrorMessage(payload, 'No se pudo guardar la identidad futura.'),
      });
      return;
    }

    if (!isFutureIdentityItem(payload)) {
      setIdentitySubmissionState({
        kind: 'error',
        message: 'La API respondio un contrato invalido al guardar la identidad.',
      });
      return;
    }

    setIdentityStatement('');
    setIdentityPurpose('');
    await loadFutureIdentities(payload.id);
    setIdentitySubmissionState({
      kind: 'success',
      message: 'La identidad futura se guardo correctamente.',
    });
    setIsGoalComposerOpen(true);
  }

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!API_BASE_URL || !selectedFutureIdentityId) {
      setGoalSubmissionState({
        kind: 'error',
        message: 'Primero selecciona una identidad futura valida.',
      });
      return;
    }

    setGoalSubmissionState({ kind: 'submitting' });

    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/future-identities/${selectedFutureIdentityId}/goals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            desiredOutcome: goalDesiredOutcome,
            purpose: goalPurpose,
          }),
        },
      );
    } catch {
      setGoalSubmissionState({
        kind: 'error',
        message: 'No se pudo conectar con la API. Verifica que el backend este iniciado.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
      setGoalSubmissionState({
        kind: 'error',
        message: getApiErrorMessage(payload, 'No se pudo guardar la meta.'),
      });
      return;
    }

    if (!isGoalItem(payload)) {
      setGoalSubmissionState({
        kind: 'error',
        message: 'La API respondio un contrato invalido al guardar la meta.',
      });
      return;
    }

    setGoalDesiredOutcome('');
    setGoalPurpose('');
    await loadGoals(selectedFutureIdentityId);
    setGoalSubmissionState({
      kind: 'success',
      message: 'La transformacion se guardo correctamente.',
    });
  }

  function handleSelectFutureIdentity(futureIdentityId: string) {
    setSelectedFutureIdentityId(futureIdentityId);
    setGoalDesiredOutcome('');
    setGoalPurpose('');
    setGoalSubmissionState({ kind: 'idle' });
  }

  return (
    <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-8">
        <section className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-accent">Synapse</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Defini tu direccion y la transformacion que queres volver real.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Milestone 2A conecta identidades futuras con metas persistidas, sin
              introducir todavia nodos ni grafo visual.
            </p>
          </div>

          <form className="mt-8 grid gap-6" onSubmit={handleFutureIdentitySubmit}>
            <div className="grid gap-3">
              <label className="text-sm font-medium text-white" htmlFor="statement">
                En quien queres convertirte?
              </label>
              <textarea
                id="statement"
                className="min-h-28 rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
                placeholder="Software Architect con dominio practico de Cloud e IA"
                value={identityStatement}
                onChange={(event) => setIdentityStatement(event.target.value)}
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
                onChange={(event) => setIdentityPurpose(event.target.value)}
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
              'Selecciona o crea una identidad futura para empezar a registrar transformaciones concretas.'}
            {identitySubmissionState.kind === 'submitting' &&
              'Persistiendo la identidad futura en PostgreSQL...'}
            {identitySubmissionState.kind === 'success' && identitySubmissionState.message}
            {identitySubmissionState.kind === 'error' && identitySubmissionState.message}
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
              Milestone 2A
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
                empezar a asociarle metas.
              </div>
            )}

            {futureIdentityState.kind === 'ready' &&
              identities.map((identity) => {
                const isSelected = identity.id === selectedFutureIdentityId;

                return (
                  <button
                    key={identity.id}
                    type="button"
                    onClick={() => handleSelectFutureIdentity(identity.id)}
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
                    <p className="mt-3 text-sm leading-7 text-muted">{identity.purpose}</p>
                  </button>
                );
              })}
          </div>
        </section>
      </div>

      <div className="grid gap-8">
        <section className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
          <div className="border-b border-border pb-5">
            <p className="text-sm uppercase tracking-[0.3em] text-accent">
              Metas vinculadas
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {selectedIdentity
                ? 'Transformaciones asociadas a la identidad seleccionada'
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
                  onClick={() => setIsGoalComposerOpen((value) => !value)}
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
                <form className="mt-6 grid gap-6" onSubmit={handleGoalSubmit}>
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
                      onChange={(event) => setGoalDesiredOutcome(event.target.value)}
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
                      onChange={(event) => setGoalPurpose(event.target.value)}
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
                  selectedGoals.map((goal) => (
                    <article
                      key={goal.id}
                      className="rounded-2xl border border-border bg-background/60 p-5"
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-accent">
                        {new Date(goal.createdAt).toLocaleString('es-AR')}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {goal.desiredOutcome}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted">{goal.purpose}</p>
                    </article>
                  ))}
              </div>
            </>
          )}
        </section>
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
