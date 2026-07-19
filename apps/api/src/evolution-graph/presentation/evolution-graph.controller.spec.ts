import { HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { FutureIdentityNotFoundError } from '../../goal/application/errors/future-identity-not-found.error';
import {
  GET_EVOLUTION_GRAPH,
  GetEvolutionGraph,
} from '../application/use-cases/get-evolution-graph';
import { EvolutionGraphController } from './evolution-graph.controller';

describe('EvolutionGraphController', () => {
  const futureIdentityId = '8b0ce0bb-2a66-4d0b-b457-8d98df479a01';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  }

  function buildGraph() {
    return {
      nodes: [
        {
          id: futureIdentityId,
          type: 'future_identity' as const,
          label: 'Solution Architect',
          description: 'Construir criterio tecnico y de producto.',
        },
        {
          id: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
          type: 'goal' as const,
          label: 'Dominar arquitectura cloud',
          description: 'Por que esta transformacion importa.',
        },
        {
          id: 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318',
          type: 'attention_node' as const,
          label: 'AWS',
          description: 'Profundizar en servicios cloud.',
        },
      ],
      relationships: [
        {
          from: futureIdentityId,
          to: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
          type: 'has_goal' as const,
        },
        {
          from: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
          to: 'f0c8f9c2-622e-48e4-b17f-0ae2991e5318',
          type: 'has_attention_node' as const,
        },
      ],
    };
  }

  async function createFixture() {
    const getEvolutionGraph = {
      execute: jest.fn(),
    } as unknown as GetEvolutionGraph;

    const moduleRef = await Test.createTestingModule({
      controllers: [EvolutionGraphController],
      providers: [
        {
          provide: GET_EVOLUTION_GRAPH,
          useValue: getEvolutionGraph,
        },
      ],
    }).compile();

    return {
      controller: moduleRef.get(EvolutionGraphController),
      getEvolutionGraph,
    };
  }

  it('returns 200 on a successful GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    const graph = buildGraph();

    jest.spyOn(fixture.getEvolutionGraph, 'execute').mockResolvedValue(graph);

    const result = await fixture.controller.findOne(
      { futureIdentityId },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual(graph);
    expect(fixture.getEvolutionGraph.execute).toHaveBeenCalledWith({
      futureIdentityId,
    });
  });

  it('returns 400 for an invalid UUID path param', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    const result = await fixture.controller.findOne(
      { futureIdentityId: 'not-a-uuid' },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'El cuerpo de la solicitud no tiene el formato esperado.',
      },
    });
    expect(fixture.getEvolutionGraph.execute).not.toHaveBeenCalled();
  });

  it('returns 404 when the future identity does not exist', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.getEvolutionGraph, 'execute')
      .mockRejectedValue(new FutureIdentityNotFoundError());

    const result = await fixture.controller.findOne(
      { futureIdentityId },
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

  it('returns 500 for an unexpected error without leaking details', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.spyOn(fixture.getEvolutionGraph, 'execute').mockRejectedValue(
      new Error(
        'password authentication failed at postgresql://synapse:synapse@localhost:5432/synapse',
      ),
    );

    const result = await fixture.controller.findOne(
      { futureIdentityId },
      response,
    );
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
});
