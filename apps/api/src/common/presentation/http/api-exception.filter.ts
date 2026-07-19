import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import {
  internalErrorResponse,
  invalidRequestErrorResponse,
  resourceNotFoundErrorResponse,
} from './api-error-response';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (isBadRequestLike(exception)) {
      response.status(400).json(invalidRequestErrorResponse());
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (status === 404) {
        response.status(404).json(resourceNotFoundErrorResponse());
        return;
      }

      if (status < 500) {
        response.status(status).json(internalErrorResponse());
        return;
      }
    }

    this.logger.error(
      'Unhandled HTTP exception',
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(500).json(internalErrorResponse());
  }
}

function isBadRequestLike(exception: unknown): boolean {
  if (exception instanceof HttpException) {
    return exception.getStatus() === 400;
  }

  if (typeof exception !== 'object' || exception === null) {
    return false;
  }

  const candidate = exception as {
    status?: unknown;
    statusCode?: unknown;
  };

  return candidate.status === 400 || candidate.statusCode === 400;
}
