# Architecture

## Arquitectura actual

El sistema actual valida la comunicacion completa entre cuatro piezas:

- Navegador.
- Frontend en Next.js (`apps/web`).
- API en NestJS (`apps/api`).
- PostgreSQL en Docker Compose.

El frontend consulta `GET /health` de la API y la API ejecuta una consulta real `SELECT 1` sobre PostgreSQL antes de responder. La respuesta expone `status`, `services.database` y un `timestamp` en formato ISO 8601 UTC generado por cada request. El frontend valida ese contrato en runtime antes de renderizarlo, distingue entre API no accesible y respuesta invalida, y trata un HTTP `503` con payload valido como un estado degradado visible. Cuando la conexion a la base falla, la API responde un estado degradado y usa HTTP `503` sin exponer credenciales ni detalles internos.

Milestone 1 agrega el primer corte vertical de negocio:

- `POST /future-identities`
- `GET /future-identities`

La API implementa el feature `future-identity` con fronteras explicitas:

- `domain`: entidad inmutable `FutureIdentity` y validaciones de dominio.
- `application`: puertos y casos de uso sin dependencias de NestJS, HTTP, Drizzle ni PostgreSQL.
- `infrastructure`: adaptadores productivos para reloj, UUID y persistencia con Drizzle sobre el `Pool` existente de `pg`.
- `presentation`: controller HTTP, DTOs y validacion estructural con Zod.

La persistencia usa Drizzle ORM y Drizzle Kit solo en infraestructura. Las migraciones son explicitas y no se ejecutan automaticamente al iniciar la API.

Milestone 2A agrega el segundo corte vertical de negocio, todavia sin nodos ni grafo:

- `POST /future-identities/:futureIdentityId/goals`
- `GET /future-identities/:futureIdentityId/goals`

La API implementa el feature `goal` con la misma separacion por fronteras:

- `domain`: entidad inmutable `Goal` y validaciones de dominio.
- `application`: casos de uso que verifican primero la existencia de `FutureIdentity`.
- `infrastructure`: schema, repositorio Drizzle y migracion incremental sobre PostgreSQL.
- `presentation`: controller HTTP, DTOs y validacion estructural con Zod para body y params.

Los puertos `Clock` e `IdGenerator` se movieron a una ubicacion comun para reutilizarse entre `future-identity` y `goal`. El `ApiExceptionFilter` global ahora distingue `400 INVALID_REQUEST`, `404 RESOURCE_NOT_FOUND` para rutas inexistentes y `500 INTERNAL_ERROR` para errores no controlados, sin exponer detalles internos.

Milestone 2B agrega areas de atencion independientes y su vinculacion atomica con metas, todavia sin React Flow ni grafo visual:

- `POST /goals/:goalId/attention-nodes`
- `GET /goals/:goalId/attention-nodes`

La API implementa el feature `attention-node` con la misma separacion por fronteras:

- `domain`: entidad inmutable `AttentionNode` y validaciones de dominio.
- `application`: casos de uso que verifican primero la existencia de `Goal`.
- `infrastructure`: schemas `attention_nodes` y `goal_attention_nodes`, repositorio Drizzle y migracion incremental sobre PostgreSQL.
- `presentation`: controller HTTP, DTOs y validacion estructural con Zod para body y params.

La persistencia de `AttentionNode` usa una transaccion Drizzle real dentro del repositorio para insertar el nodo y crear su vinculacion con la meta en una sola operacion atomica. Si falla cualquiera de los inserts, PostgreSQL hace rollback y no queda un nodo huerfano. No se agrego un Unit of Work generico ni se expuso la transaccion fuera de infraestructura.

En frontend, la experiencia sigue siendo un workspace unico cliente, pero se refactorizo en paneles presentacionales para identidad, meta y area de atencion. La coordinacion principal permanece centralizada, se cargan solo metas de la identidad seleccionada y solo nodos de la meta seleccionada, y se evita que respuestas viejas sobrescriban el estado actual mediante identificadores de request.

Milestone 2C agrega el modelo de lectura backend para consultar el grafo de evolucion de una identidad futura:

- `GET /future-identities/:futureIdentityId/evolution-graph`

La API implementa el feature `evolution-graph` como una proyeccion de lectura, no como un agregado de dominio nuevo:

- `application`: puerto `EvolutionGraphQueryPort` y query `GetEvolutionGraph`, sin dependencias de NestJS, Drizzle, PostgreSQL ni librerias visuales.
- `infrastructure`: adapter Drizzle que arma la proyeccion desde `future_identities`, `goals`, `attention_nodes` y `goal_attention_nodes`.
- `presentation`: controller HTTP y validacion Zod del parametro `futureIdentityId`.

El contrato devuelve nodos y relaciones estructurales confirmadas de Synapse. Es agnostico de la UI: no incluye coordenadas, estilos, colores, handles, propiedades de React Flow ni persistencia de layout.

## Decisiones implementadas

- Monorepo simple con `pnpm workspaces`.
- `Next.js` con App Router, TypeScript, Tailwind CSS y ESLint.
- `NestJS` con TypeScript y una conexion a PostgreSQL mediante `pg`.
- `Drizzle ORM` y `Drizzle Kit` para persistencia y migraciones de `future-identity`, `goal` y `attention-node`.
- Proyeccion de lectura `evolution-graph` para exponer el grafo estructural confirmado sin acoplarse al canvas visual.
- Validacion tipada de variables de entorno con `zod` en el backend.
- `Docker Compose` solo para PostgreSQL, sin dockerizar frontend ni backend.

## Que se dejo deliberadamente fuera

- Autenticacion.
- Integracion con IA.
- Grafo visual.
- Redis, colas, mensajeria o microservicios.
- DDD y Clean Architecture completas.
- Librerias compartidas o capas vacias sin uso real.

## Evolucion esperada

La evolucion prevista es hacia un monolito modular, manteniendo una base simple y explicitando limites cuando el dominio real aparezca. Cuando existan casos de uso y persistencia de negocio, se podra introducir una capa de acceso a datos mas rica y modulos de dominio con responsabilidades mejor separadas.
