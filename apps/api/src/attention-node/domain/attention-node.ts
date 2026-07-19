import { AttentionNodeValidationError } from './attention-node.errors';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateAttentionNodeParams = {
  id: string;
  name: string;
  description?: string | null;
  now: Date;
};

type RestoreAttentionNodeParams = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AttentionNodeProps = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class AttentionNode {
  private constructor(private readonly props: AttentionNodeProps) {}

  static create({ id, name, description, now }: CreateAttentionNodeParams) {
    assertValidId(id);
    const createdAt = cloneValidDate(now);

    return new AttentionNode({
      id,
      name: normalizeName(name),
      description: normalizeDescription(description),
      createdAt,
      updatedAt: new Date(createdAt.getTime()),
    });
  }

  static restore({
    id,
    name,
    description,
    createdAt,
    updatedAt,
  }: RestoreAttentionNodeParams) {
    assertValidId(id);
    const restoredCreatedAt = cloneValidDate(createdAt);
    const restoredUpdatedAt = cloneValidDate(updatedAt);

    if (restoredUpdatedAt.getTime() < restoredCreatedAt.getTime()) {
      throw new AttentionNodeValidationError(
        'INVALID_ATTENTION_NODE_TIMESTAMP',
        'El area de atencion tiene timestamps invalidos.',
      );
    }

    return new AttentionNode({
      id,
      name: normalizeName(name),
      description: normalizeDescription(description),
      createdAt: restoredCreatedAt,
      updatedAt: restoredUpdatedAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get createdAt() {
    return new Date(this.props.createdAt.getTime());
  }

  get updatedAt() {
    return new Date(this.props.updatedAt.getTime());
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

function assertValidId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new AttentionNodeValidationError(
      'INVALID_ATTENTION_NODE_ID',
      'El area de atencion tiene un identificador invalido.',
      'id',
    );
  }
}

function normalizeName(value: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new AttentionNodeValidationError(
      'EMPTY_ATTENTION_NODE_NAME',
      'El nombre del area de atencion es obligatorio.',
      'name',
    );
  }

  if (normalized.length > 100) {
    throw new AttentionNodeValidationError(
      'ATTENTION_NODE_NAME_TOO_LONG',
      'El nombre del area de atencion no puede superar 100 caracteres.',
      'name',
    );
  }

  return normalized;
}

function normalizeDescription(value?: string | null) {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (normalized.length > 1000) {
    throw new AttentionNodeValidationError(
      'ATTENTION_NODE_DESCRIPTION_TOO_LONG',
      'La descripcion del area de atencion no puede superar 1000 caracteres.',
      'description',
    );
  }

  return normalized;
}

function cloneValidDate(value: Date) {
  const cloned = new Date(value.getTime());

  if (Number.isNaN(cloned.getTime())) {
    throw new AttentionNodeValidationError(
      'INVALID_ATTENTION_NODE_TIMESTAMP',
      'El area de atencion tiene timestamps invalidos.',
    );
  }

  return cloned;
}
