import { HttpStatus, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import {
  CREATE_FUTURE_IDENTITY,
  CreateFutureIdentity,
} from '../application/use-cases/create-future-identity';
import {
  LIST_FUTURE_IDENTITIES,
  ListFutureIdentities,
} from '../application/use-cases/list-future-identities';
import { FutureIdentity } from '../domain/future-identity';
import { DomainValidationError } from '../domain/future-identity.errors';
import { FutureIdentityController } from './future-identity.controller';

describe('FutureIdentityController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  }

  function buildIdentity() {
    return FutureIdentity.restore({
      id: '8d84d3ef-bcab-4b85-b8b7-e7d8c85939e6',
      statement: 'Software Architect con dominio practico de Cloud e IA',
      purpose: 'Quiero mantenerme relevante y construir productos propios.',
      createdAt: new Date('2026-07-19T10:00:00.000Z'),
      updatedAt: new Date('2026-07-19T10:00:00.000Z'),
    });
  }

  async function createFixture() {
    const createFutureIdentity = {
      execute: jest.fn(),
    } as unknown as CreateFutureIdentity;
    const listFutureIdentities = {
      execute: jest.fn(),
    } as unknown as ListFutureIdentities;

    const moduleRef = await Test.createTestingModule({
      controllers: [FutureIdentityController],
      providers: [
        {
          provide: CREATE_FUTURE_IDENTITY,
          useValue: createFutureIdentity,
        },
        {
          provide: LIST_FUTURE_IDENTITIES,
          useValue: listFutureIdentities,
        },
      ],
    }).compile();

    return {
      controller: moduleRef.get(FutureIdentityController),
      createFutureIdentity,
      listFutureIdentities,
    };
  }

  it('returns 201 on a successful POST', async () => {
    const fixture = await createFixture();
    const identity = buildIdentity();
    const response = createResponse();

    jest
      .spyOn(fixture.createFutureIdentity, 'execute')
      .mockResolvedValue(identity);

    const result = await fixture.controller.create(
      {
        statement: identity.statement,
        purpose: identity.purpose,
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(result).toEqual({
      id: identity.id,
      statement: identity.statement,
      purpose: identity.purpose,
      createdAt: identity.createdAt.toISOString(),
      updatedAt: identity.updatedAt.toISOString(),
    });
  });

  it('returns 400 for an invalid request body', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    const result = await fixture.controller.create(
      {
        statement: 'Arquitecto de software',
        id: 'forbidden',
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message:
          'El cuerpo de la solicitud no tiene el formato esperado.',
      },
    });
    expect(fixture.createFutureIdentity.execute).not.toHaveBeenCalled();
  });

  it('returns 400 for a domain validation error', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.createFutureIdentity, 'execute')
      .mockRejectedValue(
        new DomainValidationError(
          'EMPTY_FUTURE_IDENTITY_STATEMENT',
          'La identidad futura es obligatoria.',
          'statement',
        ),
      );

    const result = await fixture.controller.create(
      {
        statement: '   ',
        purpose: 'Quiero mantenerme relevante.',
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toEqual({
      error: {
        code: 'EMPTY_FUTURE_IDENTITY_STATEMENT',
        message: 'La identidad futura es obligatoria.',
        field: 'statement',
      },
    });
    expect(JSON.stringify(result)).not.toContain('stack');
  });

  it('returns items on GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    const identity = buildIdentity();

    jest
      .spyOn(fixture.listFutureIdentities, 'execute')
      .mockResolvedValue([identity]);

    const result = await fixture.controller.findAll(response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual({
      items: [
        {
          id: identity.id,
          statement: identity.statement,
          purpose: identity.purpose,
          createdAt: identity.createdAt.toISOString(),
          updatedAt: identity.updatedAt.toISOString(),
        },
      ],
    });
  });

  it('returns an empty list on GET when there are no identities', async () => {
    const fixture = await createFixture();
    const response = createResponse();

    jest
      .spyOn(fixture.listFutureIdentities, 'execute')
      .mockResolvedValue([]);

    const result = await fixture.controller.findAll(response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result).toEqual({ items: [] });
  });

  it('does not leak internal details on unexpected errors', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest
      .spyOn(fixture.listFutureIdentities, 'execute')
      .mockRejectedValue(
        new Error(
          'password authentication failed for user synapse at postgresql://synapse:synapse@localhost:5432/synapse',
        ),
      );

    const result = await fixture.controller.findAll(response);
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

  it('returns 500 for a domain validation error raised during GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.spyOn(fixture.listFutureIdentities, 'execute').mockRejectedValue(
      new DomainValidationError(
        'INVALID_FUTURE_IDENTITY_TIMESTAMP',
        'La identidad futura tiene timestamps invalidos.',
      ),
    );

    const result = await fixture.controller.findAll(response);
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
    expect(serialized).not.toContain('INVALID_FUTURE_IDENTITY_TIMESTAMP');
    expect(serialized).not.toContain('timestamps invalidos');
  });

  it('returns 500 for a PostgreSQL or Drizzle error during GET', async () => {
    const fixture = await createFixture();
    const response = createResponse();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest
      .spyOn(fixture.listFutureIdentities, 'execute')
      .mockRejectedValue(
        new Error(
          'syntax error at or near "select" while using postgresql://synapse:synapse@localhost:5432/synapse',
        ),
      );

    const result = await fixture.controller.findAll(response);
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
    expect(serialized).not.toContain('syntax error at or near');
    expect(serialized).not.toContain('postgresql://');
  });
});
