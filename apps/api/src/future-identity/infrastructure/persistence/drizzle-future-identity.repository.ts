import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { FutureIdentityRepository } from '../../application/ports/future-identity.repository';
import { FutureIdentity } from '../../domain/future-identity';
import { futureIdentities } from './future-identities.schema';

export class DrizzleFutureIdentityRepository implements FutureIdentityRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async save(identity: FutureIdentity): Promise<void> {
    const data = identity.toPrimitives();

    await this.db.insert(futureIdentities).values({
      id: data.id,
      statement: data.statement,
      purpose: data.purpose,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(): Promise<FutureIdentity[]> {
    const rows = await this.db
      .select()
      .from(futureIdentities)
      .orderBy(desc(futureIdentities.createdAt), desc(futureIdentities.id));

    return rows.map((row) =>
      FutureIdentity.restore({
        id: row.id,
        statement: row.statement,
        purpose: row.purpose,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<FutureIdentity | null> {
    const [row] = await this.db
      .select()
      .from(futureIdentities)
      .where(eq(futureIdentities.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return FutureIdentity.restore({
      id: row.id,
      statement: row.statement,
      purpose: row.purpose,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
