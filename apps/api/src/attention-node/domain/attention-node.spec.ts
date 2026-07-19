import { AttentionNode } from './attention-node';
import { AttentionNodeValidationError } from './attention-node.errors';

describe('AttentionNode', () => {
  const id = '35f3f7d4-8ebf-4935-b21a-23dbb4199d6a';
  const now = new Date('2026-07-20T10:00:00.000Z');

  it('creates a valid attention node', () => {
    const node = AttentionNode.create({
      id,
      name: 'Arquitectura de software',
      description: 'Capacidad para tomar decisiones estructurales.',
      now,
    });

    expect(node.id).toBe(id);
    expect(node.name).toBe('Arquitectura de software');
    expect(node.description).toBe(
      'Capacidad para tomar decisiones estructurales.',
    );
    expect(node.createdAt.toISOString()).toBe(now.toISOString());
    expect(node.updatedAt.toISOString()).toBe(now.toISOString());
  });

  it('trims the name and description', () => {
    const node = AttentionNode.create({
      id,
      name: '  IA aplicada  ',
      description: '  Uso practico en productos reales.  ',
      now,
    });

    expect(node.name).toBe('IA aplicada');
    expect(node.description).toBe('Uso practico en productos reales.');
  });

  it('rejects an empty name', () => {
    expect(() =>
      AttentionNode.create({
        id,
        name: '   ',
        description: null,
        now,
      }),
    ).toThrow(
      new AttentionNodeValidationError(
        'EMPTY_ATTENTION_NODE_NAME',
        'El nombre del area de atencion es obligatorio.',
        'name',
      ),
    );
  });

  it('rejects a name longer than 100 characters', () => {
    expect(() =>
      AttentionNode.create({
        id,
        name: 'a'.repeat(101),
        description: null,
        now,
      }),
    ).toThrow(
      new AttentionNodeValidationError(
        'ATTENTION_NODE_NAME_TOO_LONG',
        'El nombre del area de atencion no puede superar 100 caracteres.',
        'name',
      ),
    );
  });

  it('normalizes omitted description to null', () => {
    const node = AttentionNode.create({
      id,
      name: 'PostgreSQL',
      now,
    });

    expect(node.description).toBeNull();
  });

  it('keeps a null description', () => {
    const node = AttentionNode.create({
      id,
      name: 'AWS',
      description: null,
      now,
    });

    expect(node.description).toBeNull();
  });

  it('normalizes an empty description to null', () => {
    const node = AttentionNode.create({
      id,
      name: 'Producto',
      description: '   ',
      now,
    });

    expect(node.description).toBeNull();
  });

  it('rejects a description longer than 1000 characters', () => {
    expect(() =>
      AttentionNode.create({
        id,
        name: 'Producto',
        description: 'a'.repeat(1001),
        now,
      }),
    ).toThrow(
      new AttentionNodeValidationError(
        'ATTENTION_NODE_DESCRIPTION_TOO_LONG',
        'La descripcion del area de atencion no puede superar 1000 caracteres.',
        'description',
      ),
    );
  });

  it('rejects an invalid uuid', () => {
    expect(() =>
      AttentionNode.create({
        id: 'invalid-id',
        name: 'Arquitectura',
        description: null,
        now,
      }),
    ).toThrow(
      new AttentionNodeValidationError(
        'INVALID_ATTENTION_NODE_ID',
        'El area de atencion tiene un identificador invalido.',
        'id',
      ),
    );
  });

  it('rejects an invalid timestamp', () => {
    expect(() =>
      AttentionNode.create({
        id,
        name: 'Arquitectura',
        description: null,
        now: new Date('invalid'),
      }),
    ).toThrow(
      new AttentionNodeValidationError(
        'INVALID_ATTENTION_NODE_TIMESTAMP',
        'El area de atencion tiene timestamps invalidos.',
      ),
    );
  });

  it('restores a valid attention node', () => {
    const node = AttentionNode.restore({
      id,
      name: 'Arquitectura de software',
      description: 'Decisiones estructurales.',
      createdAt: now,
      updatedAt: new Date('2026-07-20T10:30:00.000Z'),
    });

    expect(node.id).toBe(id);
    expect(node.name).toBe('Arquitectura de software');
    expect(node.description).toBe('Decisiones estructurales.');
    expect(node.createdAt.toISOString()).toBe(now.toISOString());
    expect(node.updatedAt.toISOString()).toBe('2026-07-20T10:30:00.000Z');
  });

  it('rejects restore when updatedAt is earlier than createdAt', () => {
    expect(() =>
      AttentionNode.restore({
        id,
        name: 'Arquitectura de software',
        description: null,
        createdAt: new Date('2026-07-20T10:30:00.000Z'),
        updatedAt: now,
      }),
    ).toThrow(
      new AttentionNodeValidationError(
        'INVALID_ATTENTION_NODE_TIMESTAMP',
        'El area de atencion tiene timestamps invalidos.',
      ),
    );
  });

  it('protects dates against external mutation', () => {
    const node = AttentionNode.create({
      id,
      name: 'Arquitectura de software',
      description: null,
      now,
    });

    const createdAt = node.createdAt;
    createdAt.setUTCFullYear(2000);

    expect(node.createdAt.toISOString()).toBe(now.toISOString());
  });
});
