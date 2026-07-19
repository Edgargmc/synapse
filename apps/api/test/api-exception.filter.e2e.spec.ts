import { Controller, Get, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { ApiExceptionFilter } from '../src/common/presentation/http/api-exception.filter';
import { FutureIdentityController } from '../src/future-identity/presentation/future-identity.controller';
import {
  CREATE_FUTURE_IDENTITY,
  CreateFutureIdentity,
} from '../src/future-identity/application/use-cases/create-future-identity';
import {
  LIST_FUTURE_IDENTITIES,
  ListFutureIdentities,
} from '../src/future-identity/application/use-cases/list-future-identities';
import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';

@Controller()
class BoomController {
  @Get('boom')
  fail() {
    throw new Error(
      'postgresql://synapse:synapse@localhost:5432/synapse exploded',
    );
  }
}

describe('ApiExceptionFilter (e2e)', () => {
  let app: INestApplication;
  const healthService = {
    check: jest.fn(),
  };

  beforeAll(async () => {
    const createFutureIdentity = {
      execute: jest.fn(),
    } as unknown as CreateFutureIdentity;
    const listFutureIdentities = {
      execute: jest.fn().mockResolvedValue([]),
    } as unknown as ListFutureIdentities;

    const moduleRef = await Test.createTestingModule({
      controllers: [FutureIdentityController, HealthController, BoomController],
      providers: [
        {
          provide: CREATE_FUTURE_IDENTITY,
          useValue: createFutureIdentity,
        },
        {
          provide: LIST_FUTURE_IDENTITIES,
          useValue: listFutureIdentities,
        },
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ApiExceptionFilter());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns INVALID_REQUEST for malformed JSON without leaking parser details', async () => {
    const response = await request(app.getHttpServer())
      .post('/future-identities')
      .set('Content-Type', 'application/json')
      .send('{"statement":"Arquitecto","purpose":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'El cuerpo de la solicitud no tiene el formato esperado.',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(
      'Unexpected end of JSON',
    );
    expect(JSON.stringify(response.body)).not.toContain('entity.parse.failed');
  });

  it('returns RESOURCE_NOT_FOUND for an unknown route', async () => {
    const response = await request(app.getHttpServer()).get('/missing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'El recurso solicitado no existe.',
      },
    });
  });

  it('returns INTERNAL_ERROR for an unexpected error', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const response = await request(app.getHttpServer()).get('/boom');
    const serialized = JSON.stringify(response.body);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'No se pudo completar la operacion.',
      },
    });
    expect(serialized).not.toContain('postgresql://');
    expect(serialized).not.toContain('synapse:synapse');
  });

  it('keeps GET /health at 200 for a healthy payload', async () => {
    healthService.check.mockResolvedValue({
      status: 'ok',
      services: { database: 'up' },
      timestamp: '2026-07-19T01:30:00.000Z',
    });

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      services: { database: 'up' },
      timestamp: '2026-07-19T01:30:00.000Z',
    });
  });

  it('keeps GET /health at 503 for a degraded payload', async () => {
    healthService.check.mockResolvedValue({
      status: 'degraded',
      services: { database: 'down' },
      timestamp: '2026-07-19T01:31:00.000Z',
    });

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'degraded',
      services: { database: 'down' },
      timestamp: '2026-07-19T01:31:00.000Z',
    });
  });
});
