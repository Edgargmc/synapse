import { Goal } from './goal';
import { GoalValidationError } from './goal.errors';

const validId = '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6';
const validFutureIdentityId = '8b0ce0bb-2a66-4d0b-b457-8d98df479a01';
const now = new Date('2026-07-19T10:00:00.000Z');

describe('Goal', () => {
  it('creates a valid goal', () => {
    const goal = Goal.create({
      id: validId,
      futureIdentityId: validFutureIdentityId,
      desiredOutcome:
        'Ser capaz de disenar, construir y explicar un producto real con IA aplicada.',
      purpose:
        'Convertir conocimiento teorico en experiencia practica demostrable.',
      now,
    });

    expect(goal.id).toBe(validId);
    expect(goal.futureIdentityId).toBe(validFutureIdentityId);
    expect(goal.createdAt.toISOString()).toBe(now.toISOString());
    expect(goal.updatedAt.toISOString()).toBe(now.toISOString());
  });

  it('trims desired outcome and purpose', () => {
    const goal = Goal.create({
      id: validId,
      futureIdentityId: validFutureIdentityId,
      desiredOutcome: '  Disenar un producto real con IA aplicada.  ',
      purpose: '  Validar experiencia practica demostrable.  ',
      now,
    });

    expect(goal.desiredOutcome).toBe('Disenar un producto real con IA aplicada.');
    expect(goal.purpose).toBe('Validar experiencia practica demostrable.');
  });

  it('rejects an empty desired outcome', () => {
    expect(() =>
      Goal.create({
        id: validId,
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: '   ',
        purpose: 'Importa para consolidar experiencia.',
        now,
      }),
    ).toThrow(
      new GoalValidationError(
        'EMPTY_GOAL_DESIRED_OUTCOME',
        'La transformacion concreta es obligatoria.',
        'desiredOutcome',
      ),
    );
  });

  it('rejects a desired outcome longer than 300 characters', () => {
    expect(() =>
      Goal.create({
        id: validId,
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: 'a'.repeat(301),
        purpose: 'Importa para consolidar experiencia.',
        now,
      }),
    ).toThrow(
      new GoalValidationError(
        'GOAL_DESIRED_OUTCOME_TOO_LONG',
        'La transformacion concreta no puede superar 300 caracteres.',
        'desiredOutcome',
      ),
    );
  });

  it('rejects an empty purpose', () => {
    expect(() =>
      Goal.create({
        id: validId,
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: 'Disenar un producto real con IA aplicada.',
        purpose: '   ',
        now,
      }),
    ).toThrow(
      new GoalValidationError(
        'EMPTY_GOAL_PURPOSE',
        'El proposito de la meta es obligatorio.',
        'purpose',
      ),
    );
  });

  it('rejects a purpose longer than 2000 characters', () => {
    expect(() =>
      Goal.create({
        id: validId,
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: 'Disenar un producto real con IA aplicada.',
        purpose: 'a'.repeat(2001),
        now,
      }),
    ).toThrow(
      new GoalValidationError(
        'GOAL_PURPOSE_TOO_LONG',
        'El proposito de la meta no puede superar 2000 caracteres.',
        'purpose',
      ),
    );
  });

  it('rejects an invalid goal uuid', () => {
    expect(() =>
      Goal.create({
        id: 'not-a-uuid',
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: 'Disenar un producto real con IA aplicada.',
        purpose: 'Importa para consolidar experiencia.',
        now,
      }),
    ).toThrow(
      new GoalValidationError(
        'INVALID_GOAL_ID',
        'La meta tiene un identificador invalido.',
        'id',
      ),
    );
  });

  it('rejects an invalid future identity uuid', () => {
    expect(() =>
      Goal.create({
        id: validId,
        futureIdentityId: 'not-a-uuid',
        desiredOutcome: 'Disenar un producto real con IA aplicada.',
        purpose: 'Importa para consolidar experiencia.',
        now,
      }),
    ).toThrow(
      new GoalValidationError(
        'INVALID_GOAL_FUTURE_IDENTITY_ID',
        'La identidad futura asociada a la meta es invalida.',
        'futureIdentityId',
      ),
    );
  });

  it('rejects invalid timestamps', () => {
    expect(() =>
      Goal.create({
        id: validId,
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: 'Disenar un producto real con IA aplicada.',
        purpose: 'Importa para consolidar experiencia.',
        now: new Date('invalid'),
      }),
    ).toThrow(
      new GoalValidationError(
        'INVALID_GOAL_TIMESTAMP',
        'La meta tiene timestamps invalidos.',
      ),
    );
  });

  it('restores a valid goal', () => {
    const createdAt = new Date('2026-07-18T09:00:00.000Z');
    const updatedAt = new Date('2026-07-18T11:00:00.000Z');
    const goal = Goal.restore({
      id: validId,
      futureIdentityId: validFutureIdentityId,
      desiredOutcome: '  Disenar un producto real con IA aplicada.  ',
      purpose: '  Validar experiencia practica demostrable.  ',
      createdAt,
      updatedAt,
    });

    expect(goal.desiredOutcome).toBe('Disenar un producto real con IA aplicada.');
    expect(goal.purpose).toBe('Validar experiencia practica demostrable.');
    expect(goal.createdAt.toISOString()).toBe(createdAt.toISOString());
    expect(goal.updatedAt.toISOString()).toBe(updatedAt.toISOString());
  });

  it('rejects updatedAt earlier than createdAt during restore', () => {
    expect(() =>
      Goal.restore({
        id: validId,
        futureIdentityId: validFutureIdentityId,
        desiredOutcome: 'Disenar un producto real con IA aplicada.',
        purpose: 'Importa para consolidar experiencia.',
        createdAt: new Date('2026-07-18T11:00:00.000Z'),
        updatedAt: new Date('2026-07-18T10:59:59.000Z'),
      }),
    ).toThrow(
      new GoalValidationError(
        'INVALID_GOAL_TIMESTAMP',
        'La meta tiene timestamps invalidos.',
      ),
    );
  });

  it('protects dates from external mutation', () => {
    const goal = Goal.create({
      id: validId,
      futureIdentityId: validFutureIdentityId,
      desiredOutcome: 'Disenar un producto real con IA aplicada.',
      purpose: 'Importa para consolidar experiencia.',
      now,
    });

    const createdAt = goal.createdAt;
    createdAt.setUTCFullYear(2000);

    expect(goal.createdAt.toISOString()).toBe(now.toISOString());
  });
});
