# Domain Model

## Estado actual

Milestone 1 implementa la primera entidad real de Synapse: `FutureIdentity`.

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

## Flujo conceptual conocido

Identidad futura -> Meta -> Nodos -> Acciones -> Avances -> Impacto -> Reflexiones -> Aprendizaje -> Evolucion

## Limites de este documento

- No define agregados definitivos mas alla de `FutureIdentity`.
- No define bounded contexts definitivos.
- No define todavia metas, nodos, acciones ni relaciones entre ellos.

## Nota explicita

El modelo sigue siendo incremental. Synapse ya persiste identidades futuras, pero todavia no implementa metas, nodos, progreso, reflexiones ni estructuras mas ricas de dominio.
