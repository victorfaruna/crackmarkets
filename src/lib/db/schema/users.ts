import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    telegramHandle: varchar("telegram_handle", { length: 100 }),
    roboforexLinked: boolean("roboforex_linked").notNull().default(false),
    roboforexId: varchar("roboforex_id", { length: 50 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
    referredById: uuid("referred_by_id").references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 50 })
      .notNull()
      .default("EMAIL_VERIFICATION_PENDING"), // "EMAIL_VERIFICATION_PENDING" | "ACTIVE" | "SUSPENDED"
    kycStatus: varchar("kyc_status", { length: 50 })
      .notNull()
      .default("NOT_SUBMITTED"), // "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED"
    fundingStatus: varchar("funding_status", { length: 50 })
      .notNull()
      .default("LOCKED"), // "LOCKED" | "UNLOCKED"
    role: varchar("role", { length: 50 }).notNull().default("USER"), // "USER" | "ADMIN" | "SUPPORT"
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_referral_code_idx").on(table.referralCode),
    index("users_referred_by_idx").on(table.referredById),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  referrer: one(users, {
    fields: [users.referredById],
    references: [users.id],
    relationName: "user_referrals",
  }),
  referrals: many(users, {
    relationName: "user_referrals",
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
