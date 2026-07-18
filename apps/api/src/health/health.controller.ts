import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  async getHealth(@Res({ passthrough: true }) response: Response) {
    const health = await this.healthService.check();

    response.status(
      health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    );

    return health;
  }
}
