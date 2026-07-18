import { sql } from 'drizzle-orm';
import { check, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const futureIdentities = pgTable(
  'future_identities',
  {
    id: uuid('id').primaryKey(),
    statement: text('statement').notNull(),
    purpose: text('purpose').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    check(
      'future_identities_statement_length_check',
      sql`char_length(trim(${table.statement})) between 1 and 160`,
    ),
    check(
      'future_identities_purpose_length_check',
      sql`char_length(trim(${table.purpose})) between 1 and 2000`,
    ),
    check(
      'future_identities_updated_at_check',
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);
