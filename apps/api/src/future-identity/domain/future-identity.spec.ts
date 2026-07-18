import { FutureIdentity } from './future-identity';
import { DomainValidationError } from './future-identity.errors';

const validId = '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6';
const now = new Date('2026-07-19T10:00:00.000Z');

describe('FutureIdentity', () => {
  it('creates a valid future identity', () => {
    const identity = FutureIdentity.create({
      id: validId,
      statement: 'Software Architect con dominio practico de Cloud e IA',
      purpose: 'Quiero construir productos propios con criterio tecnico.',
      now,
    });

    expect(identity.id).toBe(validId);
    expect(identity.statement).toBe(
      'Software Architect con dominio practico de Cloud e IA',
    );
    expect(identity.purpose).toBe(
      'Quiero construir productos propios con criterio tecnico.',
    );
    expect(identity.createdAt.toISOString()).toBe(now.toISOString());
    expect(identity.updatedAt.toISOString()).toBe(now.toISOString());
    expect(identity.createdAt).not.toBe(now);
    expect(identity.updatedAt).not.toBe(now);
  });

  it('trims statement and purpose during creation', () => {
    const identity = FutureIdentity.create({
      id: validId,
      statement: '  Arquitecto de software  ',
      purpose: '  Para construir sistemas con criterio.  ',
      now,
    });

    expect(identity.statement).toBe('Arquitecto de software');
    expect(identity.purpose).toBe('Para construir sistemas con criterio.');
  });

  it('rejects an empty statement', () => {
    expect(() =>
      FutureIdentity.create({
        id: validId,
        statement: '   ',
        purpose: 'Quiero direccion y claridad.',
        now,
      }),
    ).toThrow(
      new DomainValidationError(
        'EMPTY_FUTURE_IDENTITY_STATEMENT',
        'La identidad futura es obligatoria.',
        'statement',
      ),
    );
  });

  it('rejects a statement longer than 160 characters', () => {
    expect(() =>
      FutureIdentity.create({
        id: validId,
        statement: 'a'.repeat(161),
        purpose: 'Quiero direccion y claridad.',
        now,
      }),
    ).toThrow(
      new DomainValidationError(
        'FUTURE_IDENTITY_STATEMENT_TOO_LONG',
        'La identidad futura no puede superar 160 caracteres.',
        'statement',
      ),
    );
  });

  it('rejects an empty purpose', () => {
    expect(() =>
      FutureIdentity.create({
        id: validId,
        statement: 'Arquitecto de software',
        purpose: '   ',
        now,
      }),
    ).toThrow(
      new DomainValidationError(
        'EMPTY_FUTURE_IDENTITY_PURPOSE',
        'El proposito de la identidad futura es obligatorio.',
        'purpose',
      ),
    );
  });

  it('rejects a purpose longer than 2000 characters', () => {
    expect(() =>
      FutureIdentity.create({
        id: validId,
        statement: 'Arquitecto de software',
        purpose: 'a'.repeat(2001),
        now,
      }),
    ).toThrow(
      new DomainValidationError(
        'FUTURE_IDENTITY_PURPOSE_TOO_LONG',
        'El proposito de la identidad futura no puede superar 2000 caracteres.',
        'purpose',
      ),
    );
  });

  it('rejects an invalid uuid', () => {
    expect(() =>
      FutureIdentity.create({
        id: 'not-a-uuid',
        statement: 'Arquitecto de software',
        purpose: 'Quiero direccion y claridad.',
        now,
      }),
    ).toThrow(
      new DomainValidationError(
        'INVALID_FUTURE_IDENTITY_ID',
        'La identidad futura tiene un identificador invalido.',
        'id',
      ),
    );
  });

  it('rejects invalid timestamps', () => {
    expect(() =>
      FutureIdentity.create({
        id: validId,
        statement: 'Arquitecto de software',
        purpose: 'Quiero direccion y claridad.',
        now: new Date('invalid'),
      }),
    ).toThrow(
      new DomainValidationError(
        'INVALID_FUTURE_IDENTITY_TIMESTAMP',
        'La identidad futura tiene timestamps invalidos.',
      ),
    );
  });

  it('restores a valid future identity preserving original timestamps', () => {
    const createdAt = new Date('2026-07-18T09:00:00.000Z');
    const updatedAt = new Date('2026-07-18T11:00:00.000Z');
    const identity = FutureIdentity.restore({
      id: validId,
      statement: '  Arquitecto de software  ',
      purpose: '  Para construir sistemas con criterio.  ',
      createdAt,
      updatedAt,
    });

    expect(identity.statement).toBe('Arquitecto de software');
    expect(identity.purpose).toBe('Para construir sistemas con criterio.');
    expect(identity.createdAt.toISOString()).toBe(createdAt.toISOString());
    expect(identity.updatedAt.toISOString()).toBe(updatedAt.toISOString());
    expect(identity.createdAt).not.toBe(createdAt);
    expect(identity.updatedAt).not.toBe(updatedAt);
  });

  it('rejects updatedAt earlier than createdAt during restore', () => {
    expect(() =>
      FutureIdentity.restore({
        id: validId,
        statement: 'Arquitecto de software',
        purpose: 'Quiero direccion y claridad.',
        createdAt: new Date('2026-07-18T11:00:00.000Z'),
        updatedAt: new Date('2026-07-18T10:59:59.000Z'),
      }),
    ).toThrow(
      new DomainValidationError(
        'INVALID_FUTURE_IDENTITY_TIMESTAMP',
        'La identidad futura tiene timestamps invalidos.',
      ),
    );
  });
});
