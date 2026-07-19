# Synapse

Synapse implementa hoy tres incrementos funcionales:

- Milestone 0: Walking Skeleton entre navegador, frontend, API y PostgreSQL.
- Milestone 1: creacion y listado de identidades futuras con proposito, persistidas en PostgreSQL.
- Milestone 2A: creacion y listado de metas vinculadas a una identidad futura.
- Milestone 2B: creacion de areas de atencion independientes y vinculacion automatica con una meta.

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

## Migrar base de datos

```bash
pnpm db:migrate
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
- Future identities: [http://localhost:3001/future-identities](http://localhost:3001/future-identities)
- Goals by identity: `http://localhost:3001/future-identities/:futureIdentityId/goals`
- Attention nodes by goal: `http://localhost:3001/goals/:goalId/attention-nodes`
- PostgreSQL: `localhost:5432`

## Flujo local recomendado

```bash
docker compose up -d
pnpm db:migrate
pnpm dev
```

## Scripts de base de datos

Desde la raiz:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Los scripts usan `DATABASE_URL` desde el `.env` raiz mediante `dotenv-cli`.

## Build, lint, tests y typecheck

```bash
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

Estado actual de `pnpm test`:

- Ejecuta tests automatizados reales del backend sobre `HealthService` y `HealthController`.
- Ejecuta tests automatizados del feature `future-identity` sobre dominio, casos de uso y controller.
- Ejecuta tests automatizados del feature `goal` sobre dominio, casos de uso y controller.
- Ejecuta tests automatizados del feature `attention-node` sobre dominio, casos de uso y controller.
- Ejecuta tests e2e del `ApiExceptionFilter` para JSON malformado, ruta inexistente, errores internos y `GET /health`.
- El paquete `apps/web` todavia no tiene tests automatizados y hoy solo informa esa ausencia sin fallar.

Comportamiento actual del frontend frente a `GET /health`:

- Valida en runtime que la respuesta tenga `status`, `services.database` y `timestamp` ISO 8601.
- Distingue entre API no accesible y respuesta invalida.
- Muestra un `503` con payload valido como estado degradado, no como falla de conectividad.

Comportamiento actual del frontend frente a `future-identities`:

- Permite crear una identidad futura con `statement` y `purpose`.
- Valida en runtime las responses de creacion, listado y error.
- Recarga la coleccion despues de crear.
- Muestra las identidades persistidas y su estado vacio inicial.

Comportamiento actual del frontend frente a `goals`:

- Selecciona inicialmente la primera identidad futura disponible.
- Carga solo las metas de la identidad seleccionada.
- Permite abrir un formulario para agregar una transformacion concreta y su proposito.
- Valida en runtime las responses de creacion, listado y error.
- Recarga las metas despues de crear y conserva los datos tras recargar la aplicacion.

Comportamiento actual del frontend frente a `attention-nodes`:

- Selecciona inicialmente la primera meta disponible de la identidad activa.
- Carga solo las areas de atencion de la meta seleccionada.
- Permite abrir un formulario para agregar un area de atencion con `name` y `description` opcional.
- Valida en runtime las responses de creacion, listado y error.
- Limpia el formulario despues de crear, recarga los nodos y conserva los datos tras recargar la aplicacion.
- Evita que respuestas viejas de metas o nodos sobrescriban la seleccion actual.

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
- `pnpm db:migrate` falla: verificar que PostgreSQL este levantado y que `DATABASE_URL` apunte al puerto correcto.
- `/health` responde `503`: PostgreSQL no esta disponible o todavia no termino su healthcheck.
- una ruta inexistente devuelve `404 RESOURCE_NOT_FOUND`: verificar la URL del endpoint.
- El frontend no muestra estado: verificar `NEXT_PUBLIC_API_BASE_URL` y que la API este corriendo en `http://localhost:3001`.
- El frontend informa respuesta invalida: revisar que `GET /health` devuelva JSON valido con `status`, `services.database` y `timestamp` ISO 8601.
- El frontend no puede guardar identidades: verificar `POST /future-identities`, la migracion aplicada y que la API este corriendo.
- El frontend no puede guardar metas: verificar que exista una identidad seleccionada y que `POST /future-identities/:futureIdentityId/goals` responda correctamente.
- El frontend no puede guardar areas de atencion: verificar que exista una meta seleccionada y que `POST /goals/:goalId/attention-nodes` responda correctamente.
- `docker compose up -d` falla porque `5432` ya esta en uso: ajustar `POSTGRES_PORT` y `DATABASE_URL` en `.env` a un puerto libre, por ejemplo `5433`.
