import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 300 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(), // "TRADING_CONTEST" | "WEBINAR" | "LEADERSHIP_POOL" | "PARTNER_SUMMIT"
    description: text("description").notNull().default(""),
    rewardPool: varchar("reward_pool", { length: 255 }), // nullable
    imageUrl: varchar("image_url", { length: 1000 }), // nullable – path or URL to event poster/banner
    location: varchar("location", { length: 255 }).notNull().default("Online"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    status: varchar("status", { length: 50 }).notNull().default("UPCOMING"), // "UPCOMING" | "LIVE" | "COMPLETED"
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("events_status_idx").on(table.status),
    index("events_category_idx").on(table.category),
    index("events_starts_at_idx").on(table.startsAt),
  ],
);

// Relations
export const eventsRelations = relations(events, ({ one }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
