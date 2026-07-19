import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

import {
  internalErrorResponse,
  invalidRequestErrorResponse,
} from '../../common/presentation/http/api-error-response';
import { FutureIdentityNotFoundError } from '../application/errors/future-identity-not-found.error';
import {
  CREATE_GOAL,
  CreateGoal,
} from '../application/use-cases/create-goal';
import {
  LIST_GOALS_BY_FUTURE_IDENTITY,
  ListGoalsByFutureIdentity,
} from '../application/use-cases/list-goals-by-future-identity';
import { GoalValidationError } from '../domain/goal.errors';
import {
  CreateGoalRequest,
  createGoalRequestSchema,
  FutureIdentityPathParams,
  futureIdentityPathParamsSchema,
} from './dto/create-goal.request';
import { toGoalResponse } from './dto/goal.response';

@Controller('future-identities/:futureIdentityId/goals')
export class GoalController {
  private readonly logger = new Logger(GoalController.name);

  constructor(
    @Inject(CREATE_GOAL)
    private readonly createGoal: CreateGoal,
    @Inject(LIST_GOALS_BY_FUTURE_IDENTITY)
    private readonly listGoalsByFutureIdentity: ListGoalsByFutureIdentity,
  ) {}

  @Post()
  async create(
    @Param() params: unknown,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const pathParams = futureIdentityPathParamsSchema.parse(
        params,
      ) as FutureIdentityPathParams;
      const request = createGoalRequestSchema.parse(body) as CreateGoalRequest;
      const goal = await this.createGoal.execute({
        futureIdentityId: pathParams.futureIdentityId,
        desiredOutcome: request.desiredOutcome,
        purpose: request.purpose,
      });

      response.status(HttpStatus.CREATED);
      return toGoalResponse(goal);
    } catch (error) {
      return this.handleCreateError(response, error);
    }
  }

  @Get()
  async findAll(
    @Param() params: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const pathParams = futureIdentityPathParamsSchema.parse(
        params,
      ) as FutureIdentityPathParams;
      const items = await this.listGoalsByFutureIdentity.execute({
        futureIdentityId: pathParams.futureIdentityId,
      });

      response.status(HttpStatus.OK);
      return {
        items: items.map(toGoalResponse),
      };
    } catch (error) {
      return this.handleReadError(response, error);
    }
  }

  private handleCreateError(response: Response, error: unknown) {
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

    if (error instanceof GoalValidationError) {
      response.status(HttpStatus.BAD_REQUEST);
      return {
        error: {
          code: error.code,
          message: error.message,
          ...(error.field ? { field: error.field } : {}),
        },
      };
    }

    this.logUnexpectedError('Goal creation failed', error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    return internalErrorResponse();
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

    this.logUnexpectedError('Goal listing failed', error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    return internalErrorResponse();
  }

  private logUnexpectedError(message: string, error: unknown) {
    this.logger.error(message, error instanceof Error ? error.stack : undefined);
  }
}
