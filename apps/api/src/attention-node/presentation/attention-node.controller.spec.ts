import { HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { GoalNotFoundError } from '../application/errors/goal-not-found.error';
import {
  CREATE_AND_ATTACH_ATTENTION_NODE,
  CreateAndAttachAttentionNode,
} from '../application/use-cases/create-and-attach-attention-node';
import {
  LIST_ATTENTION_NODES_BY_GOAL,
  ListAttentionNodesByGoal,
} from '../application/use-cases/list-attention-nodes-by-goal';
import { AttentionNode } from '../domain/attention-node';
import { AttentionNodeValidationError } from '../domain/attention-node.errors';
import { AttentionNodeController } from './attention-node.controller';

describe('AttentionNodeController', () => {
  const goalId = 'b77e74bf-cd72-47de-a344-1524aa7d223e';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  }

  function buildAttentionNode() {
    return AttentionNode.restore({
      id: 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318',
      name: 'Arquitectura de software',
      description: 'Decisiones estructurales en sistemas reales.',
      createdAt: new Date('2026-07-20T12:00:00.000Z'),
      updatedAt: new Date('2026-07-20T12:00:00.000Z'),
    });
  }

  async function createFixture() {
    const createAndAttachAttentionNode = {
      execute: jest.fn(),
    } as unknown as CreateAndAttachAttentionNode;
    const listAttentionNodesByGoal = {
      execute: jest.fn(),
    } as unknown as ListAttentionNodesByGoal;

    const moduleRef = await Test.createTestingModule({
      controllers: [AttentionNodeController],
      providers: [
        {
          provide: CREATE_AND_ATTACH_ATTENTION_NODE,
          useValue: createAndAttachAttentionNode,
        },
        {
          provide: LIST_ATTENTION_NODES_BY_GOAL,
          useValue: listAttentionNodesByGoal,
        },
      ],
    }).compile();

    return {
      controller: moduleRef.get(AttentionNodeController),
      createAndAttachAttentionNode,
      listAttentionNodesByGoal,
    };
  }

  it('returns 201 on a successful POST', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    const attentionNode = buildAttentionNode();

    jest
      .spyOn(fixture.createAndAttachAttentionNode, 'execute')
      .mockResolvedValue(attentionNode);

    const result = await fixture.controller.create(
      { goalId },
      {
        name: attentionNode.name,
        description: attentionNode.description,
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(result).toEqual({
      id: attentionNode.id,
      name: attentionNode.name,
      description: attentionNode.description,
      createdAt: attentionNode.createdAt.toISOString(),
      updatedAt: attentionNode.updatedAt.toISOString(),
    });
  });

  it('returns 200 on a successful GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    const attentionNode = buildAttentionNode();

    jest
      .spyOn(fixture.listAttentionNodesByGoal, 'execute')
      .mockResolvedValue([attentionNode]);

    const result = await fixture.controller.findAll({ goalId }, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual({
      items: [
        {
          id: attentionNode.id,
          name: attentionNode.name,
          description: attentionNode.description,
          createdAt: attentionNode.createdAt.toISOString(),
          updatedAt: attentionNode.updatedAt.toISOString(),
        },
      ],
    });
  });

  it('returns an empty list on GET when there are no attention nodes', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.listAttentionNodesByGoal, 'execute')
      .mockResolvedValue([]);

    const result = await fixture.controller.findAll({ goalId }, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual({ items: [] });
  });

  it('returns 400 for an invalid request body', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    const result = await fixture.controller.create(
      { goalId },
      { name: 'AWS', description: 'Infraestructura', unexpected: true },
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

  it('returns 400 for an attention node validation error', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest.spyOn(fixture.createAndAttachAttentionNode, 'execute').mockRejectedValue(
      new AttentionNodeValidationError(
        'EMPTY_ATTENTION_NODE_NAME',
        'El nombre del area de atencion es obligatorio.',
        'name',
      ),
    );

    const result = await fixture.controller.create(
      { goalId },
      { name: '   ', description: 'Debe fallar.' },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toEqual({
      error: {
        code: 'EMPTY_ATTENTION_NODE_NAME',
        message: 'El nombre del area de atencion es obligatorio.',
        field: 'name',
      },
    });
  });

  it('returns 404 when the goal does not exist', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.createAndAttachAttentionNode, 'execute')
      .mockRejectedValue(new GoalNotFoundError());

    const result = await fixture.controller.create(
      { goalId },
      {
        name: 'Arquitectura de software',
        description: 'Decisiones estructurales en sistemas reales.',
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(result).toEqual({
      error: {
        code: 'GOAL_NOT_FOUND',
        message: 'La meta indicada no existe.',
        field: 'goalId',
      },
    });
  });

  it('returns 404 on GET when the goal does not exist', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.listAttentionNodesByGoal, 'execute')
      .mockRejectedValue(new GoalNotFoundError());

    const result = await fixture.controller.findAll({ goalId }, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(result).toEqual({
      error: {
        code: 'GOAL_NOT_FOUND',
        message: 'La meta indicada no existe.',
        field: 'goalId',
      },
    });
  });

  it('returns 500 for an unexpected error', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest
      .spyOn(fixture.listAttentionNodesByGoal, 'execute')
      .mockRejectedValue(
        new Error(
          'password authentication failed at postgresql://synapse:synapse@localhost:5432/synapse',
        ),
      );

    const result = await fixture.controller.findAll({ goalId }, response);
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

  it('returns 500 on GET when a reconstitution error happens', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.spyOn(fixture.listAttentionNodesByGoal, 'execute').mockRejectedValue(
      new AttentionNodeValidationError(
        'INVALID_ATTENTION_NODE_TIMESTAMP',
        'El area de atencion tiene timestamps invalidos.',
      ),
    );

    const result = await fixture.controller.findAll({ goalId }, response);
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
    expect(serialized).not.toContain('INVALID_ATTENTION_NODE_TIMESTAMP');
    expect(serialized).not.toContain('timestamps invalidos');
  });
});
