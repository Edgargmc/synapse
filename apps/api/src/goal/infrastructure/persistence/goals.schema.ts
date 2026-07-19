import { sql } from 'drizzle-orm';
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { futureIdentities } from '../../../future-identity/infrastructure/persistence/future-identities.schema';

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey(),
    futureIdentityId: uuid('future_identity_id')
      .notNull()
      .references(() => futureIdentities.id),
    desiredOutcome: text('desired_outcome').notNull(),
    purpose: text('purpose').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    index('goals_future_identity_id_idx').on(table.futureIdentityId),
    check(
      'goals_desired_outcome_length_check',
      sql`char_length(trim(${table.desiredOutcome})) between 1 and 300`,
    ),
    check(
      'goals_purpose_length_check',
      sql`char_length(trim(${table.purpose})) between 1 and 2000`,
    ),
    check(
      'goals_updated_at_check',
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);
