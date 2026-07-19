import { sql } from 'drizzle-orm';
import {
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { goals } from '../../../goal/infrastructure/persistence/goals.schema';

export const attentionNodes = pgTable(
  'attention_nodes',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    check(
      'attention_nodes_name_length_check',
      sql`char_length(trim(${table.name})) between 1 and 100`,
    ),
    check(
      'attention_nodes_description_length_check',
      sql`${table.description} is null or char_length(trim(${table.description})) between 1 and 1000`,
    ),
    check(
      'attention_nodes_updated_at_check',
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

export const goalAttentionNodes = pgTable(
  'goal_attention_nodes',
  {
    goalId: uuid('goal_id')
      .notNull()
      .references(() => goals.id),
    attentionNodeId: uuid('attention_node_id')
      .notNull()
      .references(() => attentionNodes.id),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.goalId, table.attentionNodeId],
      name: 'goal_attention_nodes_pk',
    }),
    index('goal_attention_nodes_attention_node_id_idx').on(table.attentionNodeId),
  ],
);
