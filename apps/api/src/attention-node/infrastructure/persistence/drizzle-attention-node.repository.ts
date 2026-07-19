import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { AttentionNodeRepository } from '../../application/ports/attention-node.repository';
import { AttentionNode } from '../../domain/attention-node';
import { attentionNodes, goalAttentionNodes } from './attention-nodes.schema';

export class DrizzleAttentionNodeRepository implements AttentionNodeRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async createAndAttachToGoal(node: AttentionNode, goalId: string): Promise<void> {
    const data = node.toPrimitives();

    await this.db.transaction(async (tx) => {
      await tx.insert(attentionNodes).values({
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });

      await tx.insert(goalAttentionNodes).values({
        goalId,
        attentionNodeId: data.id,
        createdAt: data.createdAt,
      });
    });
  }

  async findByGoalId(goalId: string): Promise<AttentionNode[]> {
    const rows = await this.db
      .select({
        id: attentionNodes.id,
        name: attentionNodes.name,
        description: attentionNodes.description,
        createdAt: attentionNodes.createdAt,
        updatedAt: attentionNodes.updatedAt,
      })
      .from(goalAttentionNodes)
      .innerJoin(
        attentionNodes,
        eq(goalAttentionNodes.attentionNodeId, attentionNodes.id),
      )
      .where(eq(goalAttentionNodes.goalId, goalId))
      .orderBy(desc(attentionNodes.createdAt), desc(attentionNodes.id));

    return rows.map((row) =>
      AttentionNode.restore({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }
}
