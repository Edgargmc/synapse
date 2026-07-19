import { INestApplication } from '@nestjs/common';
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

describe('ApiExceptionFilter (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const createFutureIdentity = {
      execute: jest.fn(),
    } as unknown as CreateFutureIdentity;
    const listFutureIdentities = {
      execute: jest.fn().mockResolvedValue([]),
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

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ApiExceptionFilter());

    await app.init();
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
    expect(JSON.stringify(response.body)).not.toContain('Unexpected end of JSON');
    expect(JSON.stringify(response.body)).not.toContain('entity.parse.failed');
  });
});
