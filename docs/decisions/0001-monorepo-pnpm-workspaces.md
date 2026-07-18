# ADR 0001 - Monorepo con pnpm workspaces

## Estado

Aceptada.

## Contexto

Synapse empieza con dos aplicaciones fuertemente relacionadas: `web` y `api`. En esta etapa hace falta compartir convenciones, scripts y versionado sin agregar una plataforma de build compleja.

## Decision

Usar un monorepo con `pnpm workspaces`.

## Por que no Nx o Turborepo

- El alcance actual no necesita pipelines avanzados, cache distribuido ni generadores.
- Agregar Nx o Turborepo hoy aumenta la complejidad operativa y conceptual del proyecto.
- `pnpm workspaces` resuelve instalacion, filtros y ejecucion por paquete con una configuracion minima.

## Consecuencias

- La estructura es simple y facil de entender.
- El costo de mantenimiento inicial es bajo.
- Si el repositorio crece, algunas optimizaciones tendran que incorporarse despues.

## Cuando revisar esta decision

Revisar si aparecen varias aplicaciones adicionales, tiempos de build significativos, necesidad real de cache avanzada o automatizaciones que `pnpm workspaces` deje de resolver con claridad.
