'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { AttentionNodePanel } from './attention-node-panel';
import { FutureIdentityComposer } from './future-identity-composer';
import { FutureIdentityPanel } from './future-identity-panel';
import {
  EvolutionGraphCanvas,
  EvolutionGraphSelection,
  EvolutionGraphState,
} from './graph/evolution-graph-canvas';
import { GoalPanel } from './goal-panel';
import { GoalComposer } from './goal-composer';
import { API_BASE_URL, getApiErrorMessage, parseJson } from '../../lib/api-client';
import {
  AttentionNodeItem,
  isAttentionNodeItem,
  isAttentionNodeListResponse,
} from '../../lib/attention-node-api';
import {
  FutureIdentityItem,
  isFutureIdentityItem,
  isFutureIdentityListResponse,
} from '../../lib/future-identity-api';
import { isEvolutionGraphResponse } from '../../lib/evolution-graph-api';
import { GoalItem, isGoalItem, isGoalListResponse } from '../../lib/goal-api';

type CollectionState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: FutureIdentityItem[] };

type GoalCollectionState =
  | { kind: 'idle' }
  | { kind: 'loading'; futureIdentityId: string }
  | { kind: 'error'; futureIdentityId: string; message: string }
  | { kind: 'ready'; futureIdentityId: string; items: GoalItem[] };

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

type InspectorMode =
  | { kind: 'empty' }
  | { kind: 'details'; selection: EvolutionGraphSelection }
  | { kind: 'create_future_identity' }
  | { kind: 'create_goal'; futureIdentityId: string };

export function EvolutionWorkspace() {
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
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [attentionNodeName, setAttentionNodeName] = useState('');
  const [attentionNodeDescription, setAttentionNodeDescription] = useState('');
  const [attentionNodeCollectionState, setAttentionNodeCollectionState] =
    useState<AttentionNodeCollectionState>({ kind: 'idle' });
  const [attentionNodeSubmissionState, setAttentionNodeSubmissionState] =
    useState<SubmissionState>({ kind: 'idle' });
  const [isAttentionNodeComposerOpen, setIsAttentionNodeComposerOpen] =
    useState(false);
  const [evolutionGraphState, setEvolutionGraphState] =
    useState<EvolutionGraphState>({ kind: 'idle' });
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>({
    kind: 'empty',
  });
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const latestGoalRequestId = useRef(0);
  const latestAttentionNodeRequestId = useRef(0);
  const latestEvolutionGraphRequestId = useRef(0);

  const identities =
    futureIdentityState.kind === 'ready' ? futureIdentityState.items : [];
  const selectedIdentity =
    identities.find((identity) => identity.id === selectedFutureIdentityId) ?? null;
  const selectedGoals =
    goalCollectionState.kind === 'ready' &&
    goalCollectionState.futureIdentityId === selectedFutureIdentityId
      ? goalCollectionState.items
      : [];
  const selectedGoal =
    selectedGoals.find((goal) => goal.id === selectedGoalId) ?? null;
  const attentionNodes =
    attentionNodeCollectionState.kind === 'ready' &&
    attentionNodeCollectionState.goalId === selectedGoalId
      ? attentionNodeCollectionState.items
      : [];
  const isSubmittingIdentity = identitySubmissionState.kind === 'submitting';
  const isSubmittingGoal = goalSubmissionState.kind === 'submitting';
  const isSubmittingAttentionNode =
    attentionNodeSubmissionState.kind === 'submitting';

  const resetAttentionNodeFlow = useCallback(() => {
    latestAttentionNodeRequestId.current += 1;
    setSelectedGoalId(null);
    setAttentionNodeName('');
    setAttentionNodeDescription('');
    setAttentionNodeSubmissionState({ kind: 'idle' });
    setAttentionNodeCollectionState({ kind: 'idle' });
    setIsAttentionNodeComposerOpen(false);
  }, []);

  const syncSelectedFutureIdentity = useCallback(
    (items: FutureIdentityItem[], preferredSelectionId?: string) => {
      setSelectedFutureIdentityId((currentSelection) => {
        if (items.length === 0) {
          setGoalDesiredOutcome('');
          setGoalPurpose('');
          setGoalSubmissionState({ kind: 'idle' });
          setGoalCollectionState({ kind: 'idle' });
          resetAttentionNodeFlow();
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
    [resetAttentionNodeFlow],
  );

  const syncSelectedGoal = useCallback(
    (items: GoalItem[], preferredSelectionId?: string) => {
      setSelectedGoalId((currentSelection) => {
        if (items.length === 0) {
          setAttentionNodeCollectionState({ kind: 'idle' });
          setAttentionNodeName('');
          setAttentionNodeDescription('');
          setAttentionNodeSubmissionState({ kind: 'idle' });
          setIsAttentionNodeComposerOpen(false);
          return null;
        }

        if (preferredSelectionId && items.some((goal) => goal.id === preferredSelectionId)) {
          return preferredSelectionId;
        }

        if (currentSelection && items.some((goal) => goal.id === currentSelection)) {
          return currentSelection;
        }

        return items[0].id;
      });
    },
    [],
  );

  const loadFutureIdentities = useCallback(
    async (preferredSelectionId?: string) => {
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
    },
    [syncSelectedFutureIdentity],
  );

  const loadGoals = useCallback(
    async (futureIdentityId: string, preferredGoalId?: string) => {
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
          message: 'No se pudieron cargar las transformaciones de esta identidad.',
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
      syncSelectedGoal(payload.items, preferredGoalId);
    },
    [syncSelectedGoal],
  );

  const loadAttentionNodes = useCallback(async (goalId: string) => {
    if (!API_BASE_URL) {
      setAttentionNodeCollectionState({
        kind: 'error',
        goalId,
        message: 'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    const requestId = latestAttentionNodeRequestId.current + 1;
    latestAttentionNodeRequestId.current = requestId;
    setAttentionNodeCollectionState({ kind: 'loading', goalId });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/goals/${goalId}/attention-nodes`, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });
    } catch {
      if (requestId !== latestAttentionNodeRequestId.current) {
        return;
      }

      setAttentionNodeCollectionState({
        kind: 'error',
        goalId,
        message: 'No se pudieron cargar las areas de atencion de esta meta.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (requestId !== latestAttentionNodeRequestId.current) {
      return;
    }

    if (!response.ok) {
      setAttentionNodeCollectionState({
        kind: 'error',
        goalId,
        message: getApiErrorMessage(
          payload,
          'No se pudieron cargar las areas de atencion de esta meta.',
        ),
      });
      return;
    }

    if (!isAttentionNodeListResponse(payload)) {
      setAttentionNodeCollectionState({
        kind: 'error',
        goalId,
        message: 'La API respondio un contrato invalido para las areas de atencion.',
      });
      return;
    }

    setAttentionNodeCollectionState({ kind: 'ready', goalId, items: payload.items });
  }, []);

  const loadEvolutionGraph = useCallback(async (futureIdentityId: string) => {
    if (!API_BASE_URL) {
      setEvolutionGraphState({
        kind: 'error',
        futureIdentityId,
        message: 'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    const requestId = latestEvolutionGraphRequestId.current + 1;
    latestEvolutionGraphRequestId.current = requestId;
    setEvolutionGraphState({ kind: 'loading', futureIdentityId });

    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/future-identities/${futureIdentityId}/evolution-graph`,
        {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      );
    } catch {
      if (requestId !== latestEvolutionGraphRequestId.current) {
        return;
      }

      setEvolutionGraphState({
        kind: 'error',
        futureIdentityId,
        message: 'No se pudo cargar el mapa visual de esta identidad.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (requestId !== latestEvolutionGraphRequestId.current) {
      return;
    }

    if (!response.ok) {
      setEvolutionGraphState({
        kind: 'error',
        futureIdentityId,
        message: getApiErrorMessage(payload, 'No se pudo cargar el mapa visual.'),
      });
      return;
    }

    if (!isEvolutionGraphResponse(payload)) {
      setEvolutionGraphState({
        kind: 'error',
        futureIdentityId,
        message: 'La API respondio un contrato invalido para el grafo.',
      });
      return;
    }

    setEvolutionGraphState({
      kind: 'ready',
      futureIdentityId,
      graph: payload,
    });
  }, []);

  useEffect(() => {
    void loadFutureIdentities();
  }, [loadFutureIdentities]);

  useEffect(() => {
    if (!selectedFutureIdentityId) {
      latestGoalRequestId.current += 1;
      latestEvolutionGraphRequestId.current += 1;
      setGoalCollectionState({ kind: 'idle' });
      setEvolutionGraphState({ kind: 'idle' });
      resetAttentionNodeFlow();
      return;
    }

    void loadGoals(selectedFutureIdentityId);
    void loadEvolutionGraph(selectedFutureIdentityId);
  }, [
    loadEvolutionGraph,
    loadGoals,
    resetAttentionNodeFlow,
    selectedFutureIdentityId,
  ]);

  useEffect(() => {
    if (!selectedGoalId) {
      latestAttentionNodeRequestId.current += 1;
      setAttentionNodeCollectionState({ kind: 'idle' });
      setIsAttentionNodeComposerOpen(false);
      return;
    }

    void loadAttentionNodes(selectedGoalId);
  }, [loadAttentionNodes, selectedGoalId]);

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
    await loadEvolutionGraph(payload.id);
    setIdentitySubmissionState({
      kind: 'success',
      message: 'La identidad futura se guardo correctamente.',
    });
    setInspectorMode({
      kind: 'details',
      selection: {
        id: payload.id,
        label: payload.statement,
        description: payload.purpose,
        kind: 'future_identity',
      },
    });
    setIsInspectorOpen(true);
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

    const futureIdentityId = selectedFutureIdentityId;

    if (
      inspectorMode.kind !== 'create_goal' ||
      inspectorMode.futureIdentityId !== futureIdentityId ||
      selectedIdentity?.id !== futureIdentityId
    ) {
      setInspectorMode({ kind: 'empty' });
      return;
    }

    setGoalSubmissionState({ kind: 'submitting' });

    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/future-identities/${futureIdentityId}/goals`,
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
    await loadGoals(futureIdentityId, payload.id);
    await loadEvolutionGraph(futureIdentityId);
    setGoalSubmissionState({
      kind: 'success',
      message: 'La transformacion se guardo correctamente.',
    });
    setIsAttentionNodeComposerOpen(false);
    setInspectorMode({
      kind: 'details',
      selection: {
        id: payload.id,
        label: payload.desiredOutcome,
        description: payload.purpose,
        kind: 'goal',
      },
    });
    setIsInspectorOpen(true);
  }

  async function handleAttentionNodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!API_BASE_URL || !selectedGoalId) {
      setAttentionNodeSubmissionState({
        kind: 'error',
        message: 'Primero selecciona una meta valida.',
      });
      return;
    }

    setAttentionNodeSubmissionState({ kind: 'submitting' });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/goals/${selectedGoalId}/attention-nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: attentionNodeName,
          description: attentionNodeDescription === '' ? undefined : attentionNodeDescription,
        }),
      });
    } catch {
      setAttentionNodeSubmissionState({
        kind: 'error',
        message: 'No se pudo conectar con la API. Verifica que el backend este iniciado.',
      });
      return;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
      setAttentionNodeSubmissionState({
        kind: 'error',
        message: getApiErrorMessage(
          payload,
          'No se pudo guardar el area de atencion.',
        ),
      });
      return;
    }

    if (!isAttentionNodeItem(payload)) {
      setAttentionNodeSubmissionState({
        kind: 'error',
        message:
          'La API respondio un contrato invalido al guardar el area de atencion.',
      });
      return;
    }

    setAttentionNodeName('');
    setAttentionNodeDescription('');
    await loadAttentionNodes(selectedGoalId);
    if (selectedFutureIdentityId) {
      await loadEvolutionGraph(selectedFutureIdentityId);
    }
    setAttentionNodeSubmissionState({
      kind: 'success',
      message: 'El area de atencion se guardo y vinculo correctamente.',
    });
  }

  function handleSelectFutureIdentity(futureIdentityId: string) {
    latestGoalRequestId.current += 1;
    latestAttentionNodeRequestId.current += 1;
    latestEvolutionGraphRequestId.current += 1;
    setSelectedFutureIdentityId(futureIdentityId);
    setInspectorMode((currentMode) =>
      currentMode.kind === 'details' || currentMode.kind === 'create_goal'
        ? { kind: 'empty' }
        : currentMode,
    );
    setSelectedGoalId(null);
    setGoalDesiredOutcome('');
    setGoalPurpose('');
    setGoalSubmissionState({ kind: 'idle' });
    setAttentionNodeName('');
    setAttentionNodeDescription('');
    setAttentionNodeSubmissionState({ kind: 'idle' });
    setAttentionNodeCollectionState({ kind: 'idle' });
    setEvolutionGraphState({ kind: 'loading', futureIdentityId });
    setIsAttentionNodeComposerOpen(false);
  }

  function handleSelectGoal(goalId: string) {
    latestAttentionNodeRequestId.current += 1;
    setSelectedGoalId(goalId);
    setAttentionNodeName('');
    setAttentionNodeDescription('');
    setAttentionNodeSubmissionState({ kind: 'idle' });
  }

  let visibleEvolutionGraphState: EvolutionGraphState = { kind: 'idle' };

  if (evolutionGraphState.kind === 'idle') {
    visibleEvolutionGraphState = evolutionGraphState;
  } else if (
    selectedFutureIdentityId &&
    evolutionGraphState.futureIdentityId === selectedFutureIdentityId
  ) {
    visibleEvolutionGraphState = evolutionGraphState;
  } else if (selectedFutureIdentityId) {
    visibleEvolutionGraphState = {
      kind: 'loading',
      futureIdentityId: selectedFutureIdentityId,
    };
  }

  return (
    <div className="grid gap-8">
      {/* Barra superior con identidad seleccionada */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-white">Synapse</h1>
          {selectedIdentity && (
            <p className="mt-1 text-sm text-slate-300">
              {selectedIdentity.statement}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsInspectorOpen(!isInspectorOpen)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
        >
          {isInspectorOpen ? 'Cerrar Inspector' : 'Abrir Inspector'}
        </button>
        <button
          type="button"
          onClick={() => {
            setInspectorMode({ kind: 'create_future_identity' });
            setIdentitySubmissionState({ kind: 'idle' });
            setIsInspectorOpen(true);
          }}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Nueva identidad
        </button>
        <button
          type="button"
          onClick={() => {
            if (!selectedFutureIdentityId || !selectedIdentity) {
              return;
            }

            setInspectorMode({
              kind: 'create_goal',
              futureIdentityId: selectedFutureIdentityId,
            });
            setGoalSubmissionState({ kind: 'idle' });
            setIsInspectorOpen(true);
          }}
          disabled={!selectedFutureIdentityId || !selectedIdentity}
          className="rounded-full border border-accent/40 bg-accentSoft px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Nueva meta
        </button>
      </div>

      {/* Contenido principal: canvas y/o inspector */}
      <section
        className={
          isInspectorOpen
            ? 'grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]'
            : 'grid grid-cols-1 gap-8'
        }
      >
        {/* Canvas siempre presente */}
        <EvolutionGraphCanvas
          graphState={visibleEvolutionGraphState}
          onNodeSelectionChange={(selection) => {
            if (selection) {
              setInspectorMode({ kind: 'details', selection });
              setIsInspectorOpen(true);
              return;
            }

            setInspectorMode({ kind: 'empty' });
          }}
        />

        {isInspectorOpen && (
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              {inspectorMode.kind === 'create_future_identity'
                ? 'Nueva identidad futura'
                : inspectorMode.kind === 'create_goal'
                  ? 'Nueva meta'
                : 'Inspector'}
            </h2>
            {inspectorMode.kind === 'details' ? (
              <>
                <span className="self-start rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-sky-100">
                  {getEvolutionGraphNodeKindLabel(inspectorMode.selection.kind)}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Nombre
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {inspectorMode.selection.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Descripción o propósito
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {inspectorMode.selection.description ?? 'Sin descripción adicional'}
                  </p>
                </div>
                <p className="text-xs break-all text-slate-500">
                  ID: {inspectorMode.selection.id}
                </p>
              </>
            ) : inspectorMode.kind === 'create_future_identity' ? (
              <>
                <FutureIdentityComposer
                  identityStatement={identityStatement}
                  identityPurpose={identityPurpose}
                  onStatementChange={setIdentityStatement}
                  onPurposeChange={setIdentityPurpose}
                  onSubmit={handleFutureIdentitySubmit}
                  isSubmittingIdentity={isSubmittingIdentity}
                  identitySubmissionState={identitySubmissionState}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIdentityStatement('');
                    setIdentityPurpose('');
                    setIdentitySubmissionState({ kind: 'idle' });
                    setInspectorMode({ kind: 'empty' });
                  }}
                  className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) :
              inspectorMode.kind === 'create_goal' &&
              selectedIdentity?.id === inspectorMode.futureIdentityId ? (
              <>
                <p className="text-sm text-slate-300">
                  Para: {selectedIdentity.statement}
                </p>
                <GoalComposer
                  selectedIdentity={selectedIdentity}
                  goalDesiredOutcome={goalDesiredOutcome}
                  goalPurpose={goalPurpose}
                  onGoalDesiredOutcomeChange={setGoalDesiredOutcome}
                  onGoalPurposeChange={setGoalPurpose}
                  onSubmit={handleGoalSubmit}
                  isSubmittingGoal={isSubmittingGoal}
                  goalSubmissionState={goalSubmissionState}
                />
                <button
                  type="button"
                  onClick={() => {
                    setGoalDesiredOutcome('');
                    setGoalPurpose('');
                    setGoalSubmissionState({ kind: 'idle' });
                    setInspectorMode({ kind: 'empty' });
                  }}
                  className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-300">
                Selecciona un elemento del mapa para ver su información.
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsInspectorOpen(false)}
              className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
            >
              Cerrar inspector
            </button>
          </div>
        )}
      </section>

      {/* Paneles de gestion: identidad futura a la izquierda, metas y areas de atencion a la derecha en xl */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <FutureIdentityPanel
          futureIdentityState={futureIdentityState}
          identities={identities}
          selectedFutureIdentityId={selectedFutureIdentityId}
          onSelectIdentity={handleSelectFutureIdentity}
        />

        <div className="grid gap-8">
          <GoalPanel
            selectedIdentity={selectedIdentity}
            selectedFutureIdentityId={selectedFutureIdentityId}
            selectedGoalId={selectedGoalId}
            selectedGoals={selectedGoals}
            goalCollectionState={goalCollectionState}
            onSelectGoal={handleSelectGoal}
          />

          <AttentionNodePanel
            selectedGoal={selectedGoal}
            selectedGoalId={selectedGoalId}
            attentionNodes={attentionNodes}
            attentionNodeCollectionState={attentionNodeCollectionState}
            isAttentionNodeComposerOpen={isAttentionNodeComposerOpen}
            onToggleAttentionNodeComposer={() =>
              setIsAttentionNodeComposerOpen((currentValue) => !currentValue)
            }
            attentionNodeName={attentionNodeName}
            attentionNodeDescription={attentionNodeDescription}
            onAttentionNodeNameChange={setAttentionNodeName}
            onAttentionNodeDescriptionChange={setAttentionNodeDescription}
            onAttentionNodeSubmit={handleAttentionNodeSubmit}
            isSubmittingAttentionNode={isSubmittingAttentionNode}
            attentionNodeSubmissionState={attentionNodeSubmissionState}
          />
        </div>
      </div>
    </div>
  );
}

function getEvolutionGraphNodeKindLabel(
  kind: EvolutionGraphSelection['kind'],
) {
  const labels: Record<EvolutionGraphSelection['kind'], string> = {
    future_identity: 'Identidad futura',
    goal: 'Meta',
    attention_node: 'Nodo de atención',
  };

  return labels[kind];
}
