# ADR 0002 - Persistencia con Drizzle ORM

## Estado

Aceptada.

## Contexto

Milestone 1 necesita persistir identidades futuras reales en PostgreSQL con migraciones versionadas, sin mezclar el dominio con detalles de NestJS, SQL o del driver `pg`.

## Decision

Usar `drizzle-orm` y `drizzle-kit` en la capa de infraestructura de la API.

## Alternativas consideradas

- `pg` manual: mantiene la menor cantidad de dependencias, pero obliga a escribir y mapear SQL a mano desde el primer caso de uso persistente.
- TypeORM: ofrece integracion fuerte con NestJS, pero acopla mas la solucion al framework y agrega una superficie mas amplia de abstracciones y decoradores.
- Prisma: tiene una DX muy buena, pero introduce un flujo y tooling mas pesados de los necesarios para este primer corte vertical.

## Por que Drizzle

- Permite mantener el dominio y la aplicacion libres de NestJS, Drizzle y PostgreSQL.
- Usa SQL y tablas explicitas, alineadas con una arquitectura simple y controlada.
- Aprovecha el `Pool` de `pg` ya existente sin crear una segunda conexion.
- Resuelve migraciones versionadas y acceso tipado sin introducir una plataforma mas pesada.

## Consecuencias

- La persistencia queda encapsulada en adapters de infraestructura.
- Las migraciones pasan a ser parte explicita del flujo operativo del proyecto.
- El equipo mantiene control directo sobre el esquema y el SQL generado.

## Cuando revisar

Revisar esta decision si el dominio incorpora relaciones mas ricas, consultas complejas recurrentes o necesidades operativas que Drizzle deje de resolver con suficiente claridad.
