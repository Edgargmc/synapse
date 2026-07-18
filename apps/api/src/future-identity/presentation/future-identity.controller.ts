import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

import {
  CreateFutureIdentity,
  CREATE_FUTURE_IDENTITY,
} from '../application/use-cases/create-future-identity';
import {
  ListFutureIdentities,
  LIST_FUTURE_IDENTITIES,
} from '../application/use-cases/list-future-identities';
import { DomainValidationError } from '../domain/future-identity.errors';
import {
  CreateFutureIdentityRequest,
  createFutureIdentityRequestSchema,
} from './dto/create-future-identity.request';
import { toFutureIdentityResponse } from './dto/future-identity.response';

@Controller()
export class FutureIdentityController {
  private readonly logger = new Logger(FutureIdentityController.name);

  constructor(
    @Inject(CREATE_FUTURE_IDENTITY)
    private readonly createFutureIdentity: CreateFutureIdentity,
    @Inject(LIST_FUTURE_IDENTITIES)
    private readonly listFutureIdentities: ListFutureIdentities,
  ) {}

  @Post('future-identities')
  async create(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const request = createFutureIdentityRequestSchema.parse(
        body,
      ) as CreateFutureIdentityRequest;
      const identity = await this.createFutureIdentity.execute(request);

      response.status(HttpStatus.CREATED);

      return toFutureIdentityResponse(identity);
    } catch (error) {
      return this.handleError(response, error);
    }
  }

  @Get('future-identities')
  async findAll(@Res({ passthrough: true }) response: Response) {
    try {
      const items = await this.listFutureIdentities.execute();

      response.status(HttpStatus.OK);

      return {
        items: items.map(toFutureIdentityResponse),
      };
    } catch (error) {
      return this.handleError(response, error);
    }
  }

  private handleError(response: Response, error: unknown) {
    if (error instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST);
      return {
        error: {
          code: 'INVALID_REQUEST',
          message:
            'El cuerpo de la solicitud no tiene el formato esperado.',
        },
      };
    }

    if (error instanceof DomainValidationError) {
      response.status(HttpStatus.BAD_REQUEST);
      return {
        error: {
          code: error.code,
          message: error.message,
          ...(error.field ? { field: error.field } : {}),
        },
      };
    }

    this.logger.error(
      'Future identity request failed',
      error instanceof Error ? error.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'No se pudo completar la operacion.',
      },
    };
  }
}
