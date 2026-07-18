import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

import { loadEnv } from '../config/env';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const env = loadEnv();

    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 3000,
    });
  }

  async ping(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
