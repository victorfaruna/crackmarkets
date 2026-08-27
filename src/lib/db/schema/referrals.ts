import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const referralNodes = pgTable(
  "referral_nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ancestorId: uuid("ancestor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    descendantId: uuid("descendant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    depth: integer("depth").notNull(), // 1 to 10
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("referral_nodes_ancestor_depth_idx").on(
      table.ancestorId,
      table.depth,
    ),
    index("referral_nodes_descendant_idx").on(table.descendantId),
  ],
);

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    balance: numeric("balance", { precision: 20, scale: 4 })
      .notNull()
      .default("0.0000"),
    availableBalance: numeric("available_balance", { precision: 20, scale: 4 })
      .notNull()
      .default("0.0000"),
    totalWithdrawn: numeric("total_withdrawn", { precision: 20, scale: 4 })
      .notNull()
      .default("0.0000"),
    lifetimeEarnings: numeric("lifetime_earnings", { precision: 20, scale: 4 })
      .notNull()
      .default("0.0000"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("wallets_user_idx").on(table.userId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceUserId: uuid("source_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
    transactionType: varchar("transaction_type", { length: 100 }).notNull(), // "COMMISSION_BONUS_1" | "LOT_BONUS_2" | "STRONG_LEG_BONUS_3" | "VOLUME_BONUS_4" | "LEADERSHIP_REWARD" | "WITHDRAWAL" | "DEPOSIT"
    referenceId: varchar("reference_id", { length: 255 }),
    level: integer("level"),
    status: varchar("status", { length: 50 }).notNull().default("COMPLETED"), // "PENDING" | "COMPLETED" | "FAILED" | "REVERSED"
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transactions_user_idx").on(table.userId),
    index("transactions_type_idx").on(table.transactionType),
  ],
);

export const referralImpressions = pgTable(
  "referral_impressions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referralCode: varchar("referral_code", { length: 50 }).notNull(),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: varchar("user_agent", { length: 500 }),
    country: varchar("country", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("referral_impressions_user_idx").on(table.userId),
    index("referral_impressions_code_idx").on(table.referralCode),
    index("referral_impressions_created_idx").on(table.createdAt),
  ],
);

// Relations
export const referralNodesRelations = relations(referralNodes, ({ one }) => ({
  ancestor: one(users, {
    fields: [referralNodes.ancestorId],
    references: [users.id],
    relationName: "ancestor_nodes",
  }),
  descendant: one(users, {
    fields: [referralNodes.descendantId],
    references: [users.id],
    relationName: "descendant_nodes",
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
    relationName: "user_transactions",
  }),
  sourceUser: one(users, {
    fields: [transactions.sourceUserId],
    references: [users.id],
    relationName: "source_user_transactions",
  }),
}));

export const referralImpressionsRelations = relations(
  referralImpressions,
  ({ one }) => ({
    user: one(users, {
      fields: [referralImpressions.userId],
      references: [users.id],
    }),
  }),
);

export type ReferralNode = typeof referralNodes.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type ReferralImpression = typeof referralImpressions.$inferSelect;
export type NewReferralImpression = typeof referralImpressions.$inferInsert;

