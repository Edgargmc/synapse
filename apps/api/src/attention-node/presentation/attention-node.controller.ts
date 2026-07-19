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
import { GoalNotFoundError } from '../application/errors/goal-not-found.error';
import {
  CREATE_AND_ATTACH_ATTENTION_NODE,
  CreateAndAttachAttentionNode,
} from '../application/use-cases/create-and-attach-attention-node';
import {
  LIST_ATTENTION_NODES_BY_GOAL,
  ListAttentionNodesByGoal,
} from '../application/use-cases/list-attention-nodes-by-goal';
import { AttentionNodeValidationError } from '../domain/attention-node.errors';
import {
  CreateAttentionNodeRequest,
  createAttentionNodeRequestSchema,
  GoalPathParams,
  goalPathParamsSchema,
} from './dto/create-attention-node.request';
import { toAttentionNodeResponse } from './dto/attention-node.response';

@Controller('goals/:goalId/attention-nodes')
export class AttentionNodeController {
  private readonly logger = new Logger(AttentionNodeController.name);

  constructor(
    @Inject(CREATE_AND_ATTACH_ATTENTION_NODE)
    private readonly createAndAttachAttentionNode: CreateAndAttachAttentionNode,
    @Inject(LIST_ATTENTION_NODES_BY_GOAL)
    private readonly listAttentionNodesByGoal: ListAttentionNodesByGoal,
  ) {}

  @Post()
  async create(
    @Param() params: unknown,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const pathParams = goalPathParamsSchema.parse(params) as GoalPathParams;
      const request = createAttentionNodeRequestSchema.parse(
        body,
      ) as CreateAttentionNodeRequest;
      const attentionNode = await this.createAndAttachAttentionNode.execute({
        goalId: pathParams.goalId,
        name: request.name,
        description: request.description,
      });

      response.status(HttpStatus.CREATED);
      return toAttentionNodeResponse(attentionNode);
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
      const pathParams = goalPathParamsSchema.parse(params) as GoalPathParams;
      const items = await this.listAttentionNodesByGoal.execute({
        goalId: pathParams.goalId,
      });

      response.status(HttpStatus.OK);
      return {
        items: items.map(toAttentionNodeResponse),
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

    if (error instanceof GoalNotFoundError) {
      response.status(HttpStatus.NOT_FOUND);
      return {
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
        },
      };
    }

    if (error instanceof AttentionNodeValidationError) {
      response.status(HttpStatus.BAD_REQUEST);
      return {
        error: {
          code: error.code,
          message: error.message,
          ...(error.field ? { field: error.field } : {}),
        },
      };
    }

    this.logUnexpectedError('Attention node creation failed', error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    return internalErrorResponse();
  }

  private handleReadError(response: Response, error: unknown) {
    if (error instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST);
      return invalidRequestErrorResponse();
    }

    if (error instanceof GoalNotFoundError) {
      response.status(HttpStatus.NOT_FOUND);
      return {
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
        },
      };
    }

    this.logUnexpectedError('Attention node listing failed', error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    return internalErrorResponse();
  }

  private logUnexpectedError(message: string, error: unknown) {
    this.logger.error(message, error instanceof Error ? error.stack : undefined);
  }
}
