import { HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { FutureIdentityNotFoundError } from '../application/errors/future-identity-not-found.error';
import {
  CREATE_GOAL,
  CreateGoal,
} from '../application/use-cases/create-goal';
import {
  LIST_GOALS_BY_FUTURE_IDENTITY,
  ListGoalsByFutureIdentity,
} from '../application/use-cases/list-goals-by-future-identity';
import { Goal } from '../domain/goal';
import { GoalValidationError } from '../domain/goal.errors';
import { GoalController } from './goal.controller';

describe('GoalController', () => {
  const futureIdentityId = '8b0ce0bb-2a66-4d0b-b457-8d98df479a01';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  }

  function buildGoal() {
    return Goal.restore({
      id: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
      futureIdentityId,
      desiredOutcome:
        'Ser capaz de disenar, construir y explicar un producto real con IA aplicada.',
      purpose:
        'Convertir conocimiento teorico en experiencia practica demostrable.',
      createdAt: new Date('2026-07-19T10:00:00.000Z'),
      updatedAt: new Date('2026-07-19T10:00:00.000Z'),
    });
  }

  async function createFixture() {
    const createGoal = {
      execute: jest.fn(),
    } as unknown as CreateGoal;
    const listGoalsByFutureIdentity = {
      execute: jest.fn(),
    } as unknown as ListGoalsByFutureIdentity;

    const moduleRef = await Test.createTestingModule({
      controllers: [GoalController],
      providers: [
        {
          provide: CREATE_GOAL,
          useValue: createGoal,
        },
        {
          provide: LIST_GOALS_BY_FUTURE_IDENTITY,
          useValue: listGoalsByFutureIdentity,
        },
      ],
    }).compile();

    return {
      controller: moduleRef.get(GoalController),
      createGoal,
      listGoalsByFutureIdentity,
    };
  }

  it('returns 201 on a successful POST', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    const goal = buildGoal();

    jest.spyOn(fixture.createGoal, 'execute').mockResolvedValue(goal);

    const result = await fixture.controller.create(
      { futureIdentityId },
      {
        desiredOutcome: goal.desiredOutcome,
        purpose: goal.purpose,
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(result).toEqual({
      id: goal.id,
      futureIdentityId: goal.futureIdentityId,
      desiredOutcome: goal.desiredOutcome,
      purpose: goal.purpose,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    });
  });

  it('returns 200 on a successful GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    const goal = buildGoal();

    jest
      .spyOn(fixture.listGoalsByFutureIdentity, 'execute')
      .mockResolvedValue([goal]);

    const result = await fixture.controller.findAll({ futureIdentityId }, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual({
      items: [
        {
          id: goal.id,
          futureIdentityId: goal.futureIdentityId,
          desiredOutcome: goal.desiredOutcome,
          purpose: goal.purpose,
          createdAt: goal.createdAt.toISOString(),
          updatedAt: goal.updatedAt.toISOString(),
        },
      ],
    });
  });

  it('returns an empty list on GET when there are no goals', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.listGoalsByFutureIdentity, 'execute')
      .mockResolvedValue([]);

    const result = await fixture.controller.findAll({ futureIdentityId }, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual({ items: [] });
  });

  it('returns 400 for an invalid request body', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    const result = await fixture.controller.create(
      { futureIdentityId },
      { desiredOutcome: 'Transformacion', unexpected: true },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'El cuerpo de la solicitud no tiene el formato esperado.',
      },
    });
  });

  it('returns 400 for a goal validation error', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest.spyOn(fixture.createGoal, 'execute').mockRejectedValue(
      new GoalValidationError(
        'EMPTY_GOAL_DESIRED_OUTCOME',
        'La transformacion concreta es obligatoria.',
        'desiredOutcome',
      ),
    );

    const result = await fixture.controller.create(
      { futureIdentityId },
      { desiredOutcome: '   ', purpose: 'Importa para consolidar experiencia.' },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toEqual({
      error: {
        code: 'EMPTY_GOAL_DESIRED_OUTCOME',
        message: 'La transformacion concreta es obligatoria.',
        field: 'desiredOutcome',
      },
    });
  });

  it('returns 404 when the future identity does not exist', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.createGoal, 'execute')
      .mockRejectedValue(new FutureIdentityNotFoundError());

    const result = await fixture.controller.create(
      { futureIdentityId },
      {
        desiredOutcome:
          'Ser capaz de disenar, construir y explicar un producto real con IA aplicada.',
        purpose:
          'Convertir conocimiento teorico en experiencia practica demostrable.',
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(result).toEqual({
      error: {
        code: 'FUTURE_IDENTITY_NOT_FOUND',
        message: 'La identidad futura indicada no existe.',
        field: 'futureIdentityId',
      },
    });
  });

          it('returns 404 on GET when the future identity does not exist', async () => {
            const fixture = await createFixture();
            const response = createResponse();

            jest
              .spyOn(fixture.listGoalsByFutureIdentity, 'execute')
              .mockRejectedValue(new FutureIdentityNotFoundError());

            const result = await fixture.controller.findAll({ futureIdentityId }, response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(result).toEqual({
              error: {
                code: 'FUTURE_IDENTITY_NOT_FOUND',
                message: 'La identidad futura indicada no existe.',
                field: 'futureIdentityId',
              },
            });
          });

  it('returns 500 for an unexpected error', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest
      .spyOn(fixture.listGoalsByFutureIdentity, 'execute')
      .mockRejectedValue(
        new Error(
          'password authentication failed at postgresql://synapse:synapse@localhost:5432/synapse',
        ),
      );

    const result = await fixture.controller.findAll({ futureIdentityId }, response);
    const serialized = JSON.stringify(result);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(result).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'No se pudo completar la operacion.',
      },
    });
    expect(serialized).not.toContain('password authentication failed');
    expect(serialized).not.toContain('postgresql://');
    expect(serialized).not.toContain('synapse:synapse');
  });

  it('does not leak internal details when a GoalValidationError happens during GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.spyOn(fixture.listGoalsByFutureIdentity, 'execute').mockRejectedValue(
      new GoalValidationError(
        'INVALID_GOAL_TIMESTAMP',
        'La meta tiene timestamps invalidos.',
      ),
    );

    const result = await fixture.controller.findAll({ futureIdentityId }, response);
    const serialized = JSON.stringify(result);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(result).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'No se pudo completar la operacion.',
      },
    });
    expect(serialized).not.toContain('INVALID_GOAL_TIMESTAMP');
    expect(serialized).not.toContain('timestamps invalidos');
  });
});
