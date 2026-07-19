import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

import {
  internalErrorResponse,
  invalidRequestErrorResponse,
} from '../../common/presentation/http/api-error-response';
import { FutureIdentityNotFoundError } from '../../goal/application/errors/future-identity-not-found.error';
import {
  GET_EVOLUTION_GRAPH,
  GetEvolutionGraph,
} from '../application/use-cases/get-evolution-graph';
import {
  EvolutionGraphPathParams,
  evolutionGraphPathParamsSchema,
} from './dto/evolution-graph.request';

@Controller('future-identities/:futureIdentityId/evolution-graph')
export class EvolutionGraphController {
  private readonly logger = new Logger(EvolutionGraphController.name);

  constructor(
    @Inject(GET_EVOLUTION_GRAPH)
    private readonly getEvolutionGraph: GetEvolutionGraph,
  ) {}

  @Get()
  async findOne(
    @Param() params: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const pathParams = evolutionGraphPathParamsSchema.parse(
        params,
      ) as EvolutionGraphPathParams;
      const graph = await this.getEvolutionGraph.execute({
        futureIdentityId: pathParams.futureIdentityId,
      });

      response.status(HttpStatus.OK);
      return graph;
    } catch (error) {
      return this.handleReadError(response, error);
    }
  }

  private handleReadError(response: Response, error: unknown) {
    if (error instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST);
      return invalidRequestErrorResponse();
    }

    if (error instanceof FutureIdentityNotFoundError) {
      response.status(HttpStatus.NOT_FOUND);
      return {
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
        },
      };
    }

    this.logger.error(
      'Evolution graph query failed',
      error instanceof Error ? error.stack : undefined,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    return internalErrorResponse();
  }
}
