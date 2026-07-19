import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { GoalRepository } from '../../application/ports/goal.repository';
import { Goal } from '../../domain/goal';
import { goals } from './goals.schema';

export class DrizzleGoalRepository implements GoalRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async save(goal: Goal): Promise<void> {
    const data = goal.toPrimitives();

    await this.db.insert(goals).values({
      id: data.id,
      futureIdentityId: data.futureIdentityId,
      desiredOutcome: data.desiredOutcome,
      purpose: data.purpose,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByFutureIdentityId(futureIdentityId: string): Promise<Goal[]> {
    const rows = await this.db
      .select()
      .from(goals)
      .where(eq(goals.futureIdentityId, futureIdentityId))
      .orderBy(desc(goals.createdAt), desc(goals.id));

    return rows.map((row) =>
      Goal.restore({
        id: row.id,
        futureIdentityId: row.futureIdentityId,
        desiredOutcome: row.desiredOutcome,
        purpose: row.purpose,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }
}
