# Domain Model

## Estado actual

Milestone 2A implementa dos entidades reales de Synapse: `FutureIdentity` y `Goal`.

## FutureIdentity implementada

Una identidad futura expresa:

- quien quiere llegar a ser el usuario;
- por que esa transformacion es importante.

La entidad implementada contiene:

- `id`
- `statement`
- `purpose`
- `createdAt`
- `updatedAt`

Invariantes implementadas:

- `statement` obligatorio, trim y maximo 160 caracteres.
- `purpose` obligatorio, trim y maximo 2000 caracteres.
- `id` con UUID valido.
- timestamps validos.
- `updatedAt >= createdAt`.

## Goal implementada

Una meta expresa una transformacion concreta asociada a una identidad futura.

La entidad implementada contiene:

- `id`
- `futureIdentityId`
- `desiredOutcome`
- `purpose`
- `createdAt`
- `updatedAt`

Invariantes implementadas:

- `id` con UUID valido.
- `futureIdentityId` con UUID valido.
- `desiredOutcome` obligatorio, trim y maximo 300 caracteres.
- `purpose` obligatorio, trim y maximo 2000 caracteres.
- timestamps validos.
- `updatedAt >= createdAt`.

Relacion implementada:

- una `FutureIdentity` puede tener varias `Goal`;
- cada `Goal` pertenece inicialmente a una sola `FutureIdentity`.

## Flujo conceptual conocido

Identidad futura -> Meta -> Nodos -> Acciones -> Avances -> Impacto -> Reflexiones -> Aprendizaje -> Evolucion

## Limites de este documento

- No define agregados definitivos mas alla de `FutureIdentity` y `Goal`.
- No define bounded contexts definitivos.
- No define todavia nodos, acciones ni relaciones entre metas y nodos.

## Nota explicita

El modelo sigue siendo incremental. Synapse ya persiste identidades futuras y metas, pero todavia no implementa nodos, progreso, reflexiones ni estructuras mas ricas de dominio.
