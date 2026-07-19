import { asc, eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import {
  EvolutionGraph,
  EvolutionGraphNode,
  EvolutionGraphQueryPort,
  EvolutionGraphRelationship,
} from '../../application/ports/evolution-graph.query-port';
import { attentionNodes, goalAttentionNodes } from '../../../attention-node/infrastructure/persistence/attention-nodes.schema';
import { futureIdentities } from '../../../future-identity/infrastructure/persistence/future-identities.schema';
import { goals } from '../../../goal/infrastructure/persistence/goals.schema';

type GoalRow = {
  id: string;
  desiredOutcome: string;
  purpose: string;
  createdAt: Date;
};

type AttentionNodeRow = {
  goalId: string;
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
};

export class DrizzleEvolutionGraphQuery implements EvolutionGraphQueryPort {
  constructor(private readonly db: NodePgDatabase) {}

  async findByFutureIdentityId(
    futureIdentityId: string,
  ): Promise<EvolutionGraph | null> {
    const [identity] = await this.db
      .select({
        id: futureIdentities.id,
        statement: futureIdentities.statement,
        purpose: futureIdentities.purpose,
      })
      .from(futureIdentities)
      .where(eq(futureIdentities.id, futureIdentityId))
      .limit(1);

    if (!identity) {
      return null;
    }

    const goalRows = await this.findGoals(futureIdentityId);
    const goalIds = goalRows.map((goal) => goal.id);
    const attentionNodeRows =
      goalIds.length > 0 ? await this.findAttentionNodes(goalIds) : [];

    return buildEvolutionGraphProjection({
      identity,
      goals: goalRows,
      attentionNodes: attentionNodeRows,
    });
  }

  private async findGoals(futureIdentityId: string): Promise<GoalRow[]> {
    return this.db
      .select({
        id: goals.id,
        desiredOutcome: goals.desiredOutcome,
        purpose: goals.purpose,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(eq(goals.futureIdentityId, futureIdentityId))
      .orderBy(asc(goals.createdAt), asc(goals.id));
  }

  private async findAttentionNodes(goalIds: string[]): Promise<AttentionNodeRow[]> {
    return this.db
      .select({
        goalId: goalAttentionNodes.goalId,
        id: attentionNodes.id,
        name: attentionNodes.name,
        description: attentionNodes.description,
        createdAt: attentionNodes.createdAt,
      })
      .from(goalAttentionNodes)
      .innerJoin(
        attentionNodes,
        eq(goalAttentionNodes.attentionNodeId, attentionNodes.id),
      )
      .where(inArray(goalAttentionNodes.goalId, goalIds))
      .orderBy(asc(attentionNodes.createdAt), asc(attentionNodes.id));
  }
}

export function buildEvolutionGraphProjection({
  identity,
  goals: goalRows,
  attentionNodes: attentionNodeRows,
}: {
  identity: {
    id: string;
    statement: string;
    purpose: string;
  };
  goals: GoalRow[];
  attentionNodes: AttentionNodeRow[];
}): EvolutionGraph {
  const sortedGoals = [...goalRows].sort(compareGoals);

  return {
    nodes: [
      {
        id: identity.id,
        type: 'future_identity',
        label: identity.statement,
        description: identity.purpose,
      },
      ...sortedGoals.map(toGoalNode),
      ...deduplicateAttentionNodes(attentionNodeRows).map(toAttentionNodeNode),
    ],
    relationships: [
      ...sortedGoals.map((goal) => ({
        from: identity.id,
        to: goal.id,
        type: 'has_goal' as const,
      })),
      ...buildAttentionNodeRelationships(sortedGoals, attentionNodeRows),
    ],
  };
}

function toGoalNode(goal: GoalRow): EvolutionGraphNode {
  return {
    id: goal.id,
    type: 'goal',
    label: goal.desiredOutcome,
    description: goal.purpose,
  };
}

function toAttentionNodeNode(node: AttentionNodeRow): EvolutionGraphNode {
  return {
    id: node.id,
    type: 'attention_node',
    label: node.name,
    description: node.description,
  };
}

function deduplicateAttentionNodes(
  rows: AttentionNodeRow[],
): AttentionNodeRow[] {
  const byId = new Map<string, AttentionNodeRow>();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, row);
    }
  }

  return Array.from(byId.values()).sort(compareAttentionNodes);
}

function buildAttentionNodeRelationships(
  goalRows: GoalRow[],
  attentionNodeRows: AttentionNodeRow[],
): EvolutionGraphRelationship[] {
  const rowsByGoalId = new Map<string, AttentionNodeRow[]>();

  for (const row of attentionNodeRows) {
    rowsByGoalId.set(row.goalId, [...(rowsByGoalId.get(row.goalId) ?? []), row]);
  }

  return goalRows.flatMap((goal) =>
    (rowsByGoalId.get(goal.id) ?? [])
      .sort(compareAttentionNodes)
      .map((node) => ({
        from: goal.id,
        to: node.id,
        type: 'has_attention_node' as const,
      })),
  );
}

function compareGoals(left: GoalRow, right: GoalRow) {
  return (
    left.createdAt.getTime() - right.createdAt.getTime() ||
    left.id.localeCompare(right.id)
  );
}

function compareAttentionNodes(
  left: AttentionNodeRow,
  right: AttentionNodeRow,
) {
  return (
    left.createdAt.getTime() - right.createdAt.getTime() ||
    left.id.localeCompare(right.id)
  );
}
