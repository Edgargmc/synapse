import { DomainValidationError } from './future-identity.errors';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateFutureIdentityParams = {
  id: string;
  statement: string;
  purpose: string;
  now: Date;
};

type RestoreFutureIdentityParams = {
  id: string;
  statement: string;
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
};

type FutureIdentityProps = {
  id: string;
  statement: string;
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
};

export class FutureIdentity {
  private constructor(private readonly props: FutureIdentityProps) {}

  static create({ id, statement, purpose, now }: CreateFutureIdentityParams) {
    assertValidId(id);

    const createdAt = cloneValidDate(now);

    return new FutureIdentity({
      id,
      statement: normalizeStatement(statement),
      purpose: normalizePurpose(purpose),
      createdAt,
      updatedAt: new Date(createdAt.getTime()),
    });
  }

  static restore({
    id,
    statement,
    purpose,
    createdAt,
    updatedAt,
  }: RestoreFutureIdentityParams) {
    assertValidId(id);

    const restoredCreatedAt = cloneValidDate(createdAt);
    const restoredUpdatedAt = cloneValidDate(updatedAt);

    if (restoredUpdatedAt.getTime() < restoredCreatedAt.getTime()) {
      throw new DomainValidationError(
        'INVALID_FUTURE_IDENTITY_TIMESTAMP',
        'La identidad futura tiene timestamps invalidos.',
      );
    }

    return new FutureIdentity({
      id,
      statement: normalizeStatement(statement),
      purpose: normalizePurpose(purpose),
      createdAt: restoredCreatedAt,
      updatedAt: restoredUpdatedAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get statement() {
    return this.props.statement;
  }

  get purpose() {
    return this.props.purpose;
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
      statement: this.statement,
      purpose: this.purpose,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

function assertValidId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new DomainValidationError(
      'INVALID_FUTURE_IDENTITY_ID',
      'La identidad futura tiene un identificador invalido.',
      'id',
    );
  }
}

function normalizeStatement(value: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new DomainValidationError(
      'EMPTY_FUTURE_IDENTITY_STATEMENT',
      'La identidad futura es obligatoria.',
      'statement',
    );
  }

  if (normalized.length > 160) {
    throw new DomainValidationError(
      'FUTURE_IDENTITY_STATEMENT_TOO_LONG',
      'La identidad futura no puede superar 160 caracteres.',
      'statement',
    );
  }

  return normalized;
}

function normalizePurpose(value: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new DomainValidationError(
      'EMPTY_FUTURE_IDENTITY_PURPOSE',
      'El proposito de la identidad futura es obligatorio.',
      'purpose',
    );
  }

  if (normalized.length > 2000) {
    throw new DomainValidationError(
      'FUTURE_IDENTITY_PURPOSE_TOO_LONG',
      'El proposito de la identidad futura no puede superar 2000 caracteres.',
      'purpose',
    );
  }

  return normalized;
}

function cloneValidDate(value: Date) {
  const cloned = new Date(value.getTime());

  if (Number.isNaN(cloned.getTime())) {
    throw new DomainValidationError(
      'INVALID_FUTURE_IDENTITY_TIMESTAMP',
      'La identidad futura tiene timestamps invalidos.',
    );
  }

  return cloned;
}
