'use client';

import { useEffect, useMemo, useState } from 'react';

import { HealthResponse, isHealthResponse } from '../lib/health-response';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: HealthResponse };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function statusColor(value: 'ok' | 'up' | 'degraded' | 'down' | 'unknown') {
  if (value === 'ok' || value === 'up') {
    return 'text-success';
  }

  if (value === 'degraded' || value === 'down') {
    return 'text-warning';
  }

  return 'text-muted';
}

export function HealthStatus() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    if (!API_BASE_URL) {
      setState({
        kind: 'error',
        message: 'Falta configurar NEXT_PUBLIC_API_BASE_URL en el entorno local.',
      });
      return;
    }

    let cancelled = false;

    async function loadHealth() {
      let response: Response;

      try {
        response = await fetch(`${API_BASE_URL}/health`, {
          headers: {
            Accept: 'application/json',
          },
        });
      } catch {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'No se pudo conectar con la API. Verifica que el backend este iniciado.',
          });
        }

        return;
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'La API respondio un body invalido para el health check.',
          });
        }

        return;
      }

      if (!isHealthResponse(payload)) {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'La API respondio un contrato invalido para el health check.',
          });
        }

        return;
      }

      if (!cancelled) {
        setState({ kind: 'ready', data: payload });
      }
    }

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const apiStatus = useMemo(() => {
    if (state.kind === 'ready') {
      return state.data.status;
    }

    if (state.kind === 'error') {
      return 'unknown';
    }

    return 'unknown';
  }, [state]);

  const databaseStatus = useMemo(() => {
    if (state.kind === 'ready') {
      return state.data.services.database;
    }

    return 'unknown';
  }, [state]);

  return (
    <section className="rounded-3xl border border-border bg-panel/90 p-8 shadow-panel backdrop-blur">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Estado del sistema</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Walking Skeleton operativo</h2>
        </div>
        <div className="rounded-full border border-accent/40 bg-accentSoft px-4 py-2 text-sm text-accent">
          Next.js + NestJS + PostgreSQL
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/60 p-5">
          <p className="text-sm text-muted">API</p>
          <p className={`mt-3 text-3xl font-semibold capitalize ${statusColor(apiStatus)}`}>
            {state.kind === 'loading' ? 'Cargando...' : apiStatus}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/60 p-5">
          <p className="text-sm text-muted">PostgreSQL</p>
          <p className={`mt-3 text-3xl font-semibold capitalize ${statusColor(databaseStatus)}`}>
            {state.kind === 'loading' ? 'Cargando...' : databaseStatus}
          </p>
        </div>
      </div>

      <div className="mt-6 min-h-14 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
        {state.kind === 'loading' && 'Consultando el health check real de la API...'}
        {state.kind === 'error' && state.message}
        {state.kind === 'ready' &&
          state.data.status === 'degraded' &&
          'La API esta disponible, pero reporta un estado degradado en PostgreSQL.'}
        {state.kind === 'ready' &&
          state.data.status === 'ok' &&
          `Ultima verificacion: ${new Date(state.data.timestamp).toLocaleString('es-AR')}`}
      </div>
    </section>
  );
}
