# Synapse

Walking Skeleton inicial de Synapse para validar la comunicacion completa entre navegador, frontend en Next.js, API en NestJS y PostgreSQL.

## Requisitos previos

- Node.js `22.16.0` o cualquier `22.x` compatible.
- Docker Desktop o Docker Engine con `docker compose`.
- `corepack` habilitado para instalar `pnpm`.

## Version de Node requerida

El repositorio fija `Node 22` en `.nvmrc` y en `package.json` mediante `engines`.

Si usas `nvm`:

```bash
nvm use
```

## Como instalar pnpm

Con Node 22, `corepack` viene incluido.

```bash
corepack enable
corepack prepare pnpm@10.13.1 --activate
```

## Configuracion local

Crear el archivo local a partir del ejemplo:

```bash
cp .env.example .env
```

El archivo `.env` es necesario para:

- `docker compose`
- `apps/api`
- `apps/web`

## Iniciar PostgreSQL

```bash
docker compose up -d
```

Verificar estado:

```bash
docker compose ps
```

## Instalar dependencias

```bash
pnpm install
```

## Ejecutar frontend y backend

Ejecutar ambos procesos:

```bash
pnpm dev
```

Ejecutar solo el frontend:

```bash
pnpm dev:web
```

Ejecutar solo la API:

```bash
pnpm dev:api
```

## URLs y puertos

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)
- Health check: [http://localhost:3001/health](http://localhost:3001/health)
- PostgreSQL: `localhost:5432`

## Build, lint, tests y typecheck

```bash
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

Estado actual de `pnpm test`:

- Ejecuta tests automatizados reales del backend sobre `HealthService` y `HealthController`.
- El paquete `apps/web` todavia no tiene tests automatizados y hoy solo informa esa ausencia sin fallar.

## Detener servicios

Detener frontend y backend iniciados con `pnpm dev`:

- Usar `Ctrl+C` en la terminal.

Detener PostgreSQL:

```bash
docker compose down
```

Si tambien quieres remover el volumen de desarrollo:

```bash
docker compose down -v
```

## Problemas comunes

- `pnpm: command not found`: ejecutar `corepack enable` y `corepack prepare pnpm@10.13.1 --activate`.
- La API falla al iniciar: verificar que exista `.env` y que `DATABASE_URL` sea valida.
- `/health` responde `503`: PostgreSQL no esta disponible o todavia no termino su healthcheck.
- El frontend no muestra estado: verificar `NEXT_PUBLIC_API_BASE_URL` y que la API este corriendo en `http://localhost:3001`.
- `docker compose up -d` falla porque `5432` ya esta en uso: ajustar `POSTGRES_PORT` y `DATABASE_URL` en `.env` a un puerto libre, por ejemplo `5433`.
