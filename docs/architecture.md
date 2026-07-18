# Architecture

## Arquitectura actual del Walking Skeleton

El sistema actual valida la comunicacion completa entre cuatro piezas:

- Navegador.
- Frontend en Next.js (`apps/web`).
- API en NestJS (`apps/api`).
- PostgreSQL en Docker Compose.

El frontend consulta `GET /health` de la API y la API ejecuta una consulta real `SELECT 1` sobre PostgreSQL antes de responder. La respuesta expone `status`, `services.database` y un `timestamp` en formato ISO 8601 UTC generado por cada request. Cuando la conexion a la base falla, la API responde un estado degradado y usa HTTP `503` sin exponer credenciales ni detalles internos.

## Decisiones implementadas

- Monorepo simple con `pnpm workspaces`.
- `Next.js` con App Router, TypeScript, Tailwind CSS y ESLint.
- `NestJS` con TypeScript y una conexion minima a PostgreSQL mediante `pg`.
- Validacion tipada de variables de entorno con `zod` en el backend.
- `Docker Compose` solo para PostgreSQL, sin dockerizar frontend ni backend.

## Por que no se usa un ORM todavia

Para este incremento solo hace falta verificar conectividad real con PostgreSQL. Incorporar un ORM ahora agregaria configuracion, convenciones y superficie tecnica que todavia no aportan valor porque aun no existen entidades, tablas, migraciones ni reglas de negocio implementadas. `pg` permite resolver el health check de forma minima y deja abierta una evolucion posterior hacia un ORM si el dominio empieza a justificarlo.

## Que se dejo deliberadamente fuera

- Autenticacion.
- Integracion con IA.
- Grafo visual.
- Entidades y tablas de negocio.
- Migraciones.
- Redis, colas, mensajeria o microservicios.
- DDD y Clean Architecture completas.
- Librerias compartidas o capas vacias sin uso real.

## Evolucion esperada

La evolucion prevista es hacia un monolito modular, manteniendo una base simple y explicitando limites cuando el dominio real aparezca. Cuando existan casos de uso y persistencia de negocio, se podra introducir una capa de acceso a datos mas rica y modulos de dominio con responsabilidades mejor separadas.
