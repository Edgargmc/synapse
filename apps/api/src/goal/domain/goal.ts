import { GoalValidationError } from './goal.errors';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateGoalParams = {
  id: string;
  futureIdentityId: string;
  desiredOutcome: string;
  purpose: string;
  now: Date;
};

type RestoreGoalParams = {
  id: string;
  futureIdentityId: string;
  desiredOutcome: string;
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
};

type GoalProps = {
  id: string;
  futureIdentityId: string;
  desiredOutcome: string;
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Goal {
  private constructor(private readonly props: GoalProps) {}

  static create({
    id,
    futureIdentityId,
    desiredOutcome,
    purpose,
    now,
  }: CreateGoalParams) {
    assertValidGoalId(id);
    assertValidFutureIdentityId(futureIdentityId);

    const createdAt = cloneValidDate(now);

    return new Goal({
      id,
      futureIdentityId,
      desiredOutcome: normalizeDesiredOutcome(desiredOutcome),
      purpose: normalizePurpose(purpose),
      createdAt,
      updatedAt: new Date(createdAt.getTime()),
    });
  }

  static restore({
    id,
    futureIdentityId,
    desiredOutcome,
    purpose,
    createdAt,
    updatedAt,
  }: RestoreGoalParams) {
    assertValidGoalId(id);
    assertValidFutureIdentityId(futureIdentityId);

    const restoredCreatedAt = cloneValidDate(createdAt);
    const restoredUpdatedAt = cloneValidDate(updatedAt);

    if (restoredUpdatedAt.getTime() < restoredCreatedAt.getTime()) {
      throw new GoalValidationError(
        'INVALID_GOAL_TIMESTAMP',
        'La meta tiene timestamps invalidos.',
      );
    }

    return new Goal({
      id,
      futureIdentityId,
      desiredOutcome: normalizeDesiredOutcome(desiredOutcome),
      purpose: normalizePurpose(purpose),
      createdAt: restoredCreatedAt,
      updatedAt: restoredUpdatedAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get futureIdentityId() {
    return this.props.futureIdentityId;
  }

  get desiredOutcome() {
    return this.props.desiredOutcome;
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
      futureIdentityId: this.futureIdentityId,
      desiredOutcome: this.desiredOutcome,
      purpose: this.purpose,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

function assertValidGoalId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new GoalValidationError(
      'INVALID_GOAL_ID',
      'La meta tiene un identificador invalido.',
      'id',
    );
  }
}

function assertValidFutureIdentityId(futureIdentityId: string) {
  if (!UUID_PATTERN.test(futureIdentityId)) {
    throw new GoalValidationError(
      'INVALID_GOAL_FUTURE_IDENTITY_ID',
      'La identidad futura asociada a la meta es invalida.',
      'futureIdentityId',
    );
  }
}

function normalizeDesiredOutcome(value: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new GoalValidationError(
      'EMPTY_GOAL_DESIRED_OUTCOME',
      'La transformacion concreta es obligatoria.',
      'desiredOutcome',
    );
  }

  if (normalized.length > 300) {
    throw new GoalValidationError(
      'GOAL_DESIRED_OUTCOME_TOO_LONG',
      'La transformacion concreta no puede superar 300 caracteres.',
      'desiredOutcome',
    );
  }

  return normalized;
}

function normalizePurpose(value: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new GoalValidationError(
      'EMPTY_GOAL_PURPOSE',
      'El proposito de la meta es obligatorio.',
      'purpose',
    );
  }

  if (normalized.length > 2000) {
    throw new GoalValidationError(
      'GOAL_PURPOSE_TOO_LONG',
      'El proposito de la meta no puede superar 2000 caracteres.',
      'purpose',
    );
  }

  return normalized;
}

function cloneValidDate(value: Date) {
  const cloned = new Date(value.getTime());

  if (Number.isNaN(cloned.getTime())) {
    throw new GoalValidationError(
      'INVALID_GOAL_TIMESTAMP',
      'La meta tiene timestamps invalidos.',
    );
  }

  return cloned;
}
