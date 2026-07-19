# Domain Model

## Estado actual

Milestone 2B implementa tres entidades reales de Synapse: `FutureIdentity`, `Goal` y `AttentionNode`. Milestone 2C agrega una proyeccion de lectura del grafo de evolucion basada en esas entidades y sus relaciones confirmadas.

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

## AttentionNode implementada

Un area de atencion expresa donde el usuario necesita invertir atencion para avanzar en una meta concreta, sin ser todavia una tarea ni una actividad.

La entidad implementada contiene:

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

Invariantes implementadas:

- `id` con UUID valido.
- `name` obligatorio, trim y maximo 100 caracteres.
- `description` opcional, trim, normalizada a `null` si llega vacia y maximo 1000 caracteres.
- timestamps validos.
- `updatedAt >= createdAt`.

Relaciones implementadas:

- una `Goal` puede vincularse con varias `AttentionNode`;
- una `AttentionNode` queda preparada para poder vincularse en el futuro con varias `Goal`;
- la relacion actual se persiste en una tabla intermedia `goal_attention_nodes`.

## Evolution Graph implementado

El grafo de evolucion es una proyeccion de lectura agnostica de la interfaz. Expone:

- un nodo `future_identity` para la identidad solicitada;
- nodos `goal` para sus metas;
- nodos `attention_node` para las areas vinculadas a esas metas;
- relaciones `has_goal` entre identidad y metas;
- relaciones `has_attention_node` entre metas y areas de atencion.

Estas relaciones son estructurales y confirmadas porque derivan de datos persistidos. No representan conexiones inferidas, sugerencias de IA, pesos, progreso, dependencias semanticas entre nodos ni layout visual.

## Flujo conceptual conocido

Identidad futura -> Meta -> Nodos -> Acciones -> Avances -> Impacto -> Reflexiones -> Aprendizaje -> Evolucion

## Limites de este documento

- No define agregados definitivos mas alla de `FutureIdentity`, `Goal` y `AttentionNode`.
- No define bounded contexts definitivos.
- No define todavia acciones, progreso, conexiones nodo-nodo ni grafo visual.

## Nota explicita

El modelo sigue siendo incremental. Synapse ya persiste identidades futuras, metas y areas de atencion vinculadas a metas, y ya expone una proyeccion backend del grafo estructural confirmado. Todavia no implementa React Flow, conexiones nodo-nodo inferidas o confirmadas, progreso, reflexiones ni estructuras mas ricas de dominio.
