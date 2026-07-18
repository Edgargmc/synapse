import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export type HealthStatus = {
  status: 'ok' | 'degraded';
  services: {
    database: 'up' | 'down';
  };
  timestamp: string;
};

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async check(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();

    try {
      await this.databaseService.ping();

      return {
        status: 'ok',
        services: {
          database: 'up',
        },
        timestamp,
      };
    } catch {
      return {
        status: 'degraded',
        services: {
          database: 'down',
        },
        timestamp,
      };
    }
  }
}
