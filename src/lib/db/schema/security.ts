import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const apiRateLimits = pgTable("api_rate_limits", {
  key: varchar("key", { length: 200 }).primaryKey(),
  count: integer("count").notNull().default(1),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
