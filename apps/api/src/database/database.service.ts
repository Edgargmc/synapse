import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { loadEnv } from '../config/env';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly db: NodePgDatabase;

  constructor() {
    const env = loadEnv();

    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 3000,
    });
    this.db = drizzle(this.pool);
  }

  async ping(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  getDb(): NodePgDatabase {
    return this.db;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
