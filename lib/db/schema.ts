import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    kind: text("kind").notNull(), // 'call' | 'meeting' | 'email'
    outcome: text("outcome").notNull(), // e.g. 'no_answer', 'connected', etc.
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("activities_user_id_occurred_at_idx").on(table.userId, table.occurredAt),
  ]
);
