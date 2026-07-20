import { EvolutionGraphResponse } from '../../../lib/evolution-graph-api';

export type GraphPosition = {
  x: number;
  y: number;
};

const GOAL_RADIUS = 280;
const ATTENTION_NODE_RADIUS = 520;
const ATTENTION_NODE_ANGLE_STEP = Math.PI / 10;
const ATTENTION_NODE_RADIUS_STEP = 42;
const VECTOR_EPSILON = 1e-6;

export function buildRadialLayout(
  graph: EvolutionGraphResponse,
): Map<string, GraphPosition> {
  const positions = new Map<string, GraphPosition>();
  const identity = graph.nodes.find((node) => node.type === 'future_identity');

  if (!identity) {
    return positions;
  }

  positions.set(identity.id, { x: 0, y: 0 });

  const goals = graph.nodes
    .filter((node) => node.type === 'goal')
    .sort((left, right) => left.id.localeCompare(right.id));

  const goalAngles = new Map<string, number>();

  goals.forEach((goal, index) => {
    const angle = resolveGoalAngle(index, goals.length);
    goalAngles.set(goal.id, angle);
    positions.set(goal.id, {
      x: GOAL_RADIUS * Math.cos(angle),
      y: GOAL_RADIUS * Math.sin(angle),
    });
  });

  const attentionNodes = graph.nodes
    .filter((node) => node.type === 'attention_node')
    .sort((left, right) => left.id.localeCompare(right.id));

  const attentionRelationships = graph.relationships
    .filter((relationship) => relationship.type === 'has_attention_node')
    .sort(
      (left, right) =>
        left.from.localeCompare(right.from) || left.to.localeCompare(right.to),
    );

  const attentionNodeToGoalIds = new Map<string, string[]>();

  for (const relationship of attentionRelationships) {
    attentionNodeToGoalIds.set(relationship.to, [
      ...(attentionNodeToGoalIds.get(relationship.to) ?? []),
      relationship.from,
    ]);
  }

  const groupedAttentionNodes = new Map<
    string,
    {
      baseAngle: number;
      attentionNodeIds: string[];
    }
  >();

  for (const attentionNode of attentionNodes) {
    const connectedGoalIds = [...new Set(attentionNodeToGoalIds.get(attentionNode.id) ?? [])]
      .filter((goalId) => goalAngles.has(goalId))
      .sort((left, right) => left.localeCompare(right));

    const connectedAngles = connectedGoalIds
      .map((goalId) => goalAngles.get(goalId))
      .filter((angle): angle is number => angle !== undefined);

    const baseAngle = resolveAttentionNodeAngle(connectedGoalIds, connectedAngles);
    const groupKey = connectedGoalIds.join('|') || `isolated:${attentionNode.id}`;
    const group = groupedAttentionNodes.get(groupKey);

    if (group) {
      group.attentionNodeIds.push(attentionNode.id);
      continue;
    }

    groupedAttentionNodes.set(groupKey, {
      baseAngle,
      attentionNodeIds: [attentionNode.id],
    });
  }

  const sortedGroups = Array.from(groupedAttentionNodes.entries()).sort(
    ([leftKey], [rightKey]) => leftKey.localeCompare(rightKey),
  );

  for (const [, group] of sortedGroups) {
    group.attentionNodeIds.sort((left, right) => left.localeCompare(right));

    group.attentionNodeIds.forEach((attentionNodeId, index) => {
      const centeredOffset = index - (group.attentionNodeIds.length - 1) / 2;
      const angle = group.baseAngle + centeredOffset * ATTENTION_NODE_ANGLE_STEP;
      const radius =
        ATTENTION_NODE_RADIUS + Math.abs(centeredOffset) * ATTENTION_NODE_RADIUS_STEP;

      positions.set(attentionNodeId, {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      });
    });
  }

  return positions;
}

function resolveGoalAngle(index: number, totalGoals: number) {
  if (totalGoals <= 1) {
    return -Math.PI / 2;
  }

  return -Math.PI / 2 + (index * Math.PI * 2) / totalGoals;
}

function resolveAttentionNodeAngle(
  goalIds: string[],
  goalAngles: number[],
): number {
  if (goalAngles.length === 0) {
    return -Math.PI / 2;
  }

  const x = goalAngles.reduce((sum, angle) => sum + Math.cos(angle), 0);
  const y = goalAngles.reduce((sum, angle) => sum + Math.sin(angle), 0);

  if (Math.abs(x) < VECTOR_EPSILON && Math.abs(y) < VECTOR_EPSILON) {
    return resolveVectorFallback(goalIds, goalAngles);
  }

  return Math.atan2(y, x);
}

function resolveVectorFallback(goalIds: string[], goalAngles: number[]) {
  const fallbackEntries = goalIds
    .map((goalId, index) => ({
      goalId,
      angle: goalAngles[index] ?? -Math.PI / 2,
    }))
    .sort((left, right) => left.goalId.localeCompare(right.goalId));

  return fallbackEntries[0]?.angle ?? -Math.PI / 2;
}
