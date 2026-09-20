import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { and, count, desc, eq, like, ne, sql } from "drizzle-orm";
import AdminDashboard, {
  type AdminAuditRow,
  type AdminUserRow,
  type AdminWithdrawalRow,
} from "@/src/components/admin/AdminDashboard";
import { getCurrentAdmin } from "@/src/lib/auth/admin";
import { db } from "@/src/lib/db";
import { auditLogs, transactions, users, wallets } from "@/src/lib/db/schema";

export const metadata: Metadata = { title: "Admin Console" };

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [
    [{ value: totalUsers }],
    [{ value: activeUsers }],
    [{ value: pendingKyc }],
    [{ value: linkedAccounts }],
    [{ value: pendingWithdrawals }],
    [{ value: walletBalance }],
    recentUsers,
    pendingWithdrawalRows,
    recentAuditRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(ne(users.role, "ADMIN")),
    db
      .select({ value: count() })
      .from(users)
      .where(and(ne(users.role, "ADMIN"), eq(users.status, "ACTIVE"))),
    db
      .select({ value: count() })
      .from(users)
      .where(and(ne(users.role, "ADMIN"), eq(users.kycStatus, "PENDING"))),
    db
      .select({ value: count() })
      .from(users)
      .where(and(ne(users.role, "ADMIN"), eq(users.roboforexLinked, true))),
    db
      .select({ value: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.transactionType, "WITHDRAWAL"),
          eq(transactions.status, "PENDING"),
        ),
      ),
    db
      .select({ value: sql<string>`coalesce(sum(${wallets.balance}), 0)::text` })
      .from(wallets),
    db
      .select({
        id: users.id,
        first_name: users.firstName,
        last_name: users.lastName,
        email: users.email,
        phone_number: users.phoneNumber,
        country: users.country,
        referral_code: users.referralCode,
        role: users.role,
        status: users.status,
        kyc_status: users.kycStatus,
        funding_status: users.fundingStatus,
        roboforex_linked: users.roboforexLinked,
        roboforex_id: users.roboforexId,
        wallet_balance: sql<string>`coalesce(${wallets.balance}, 0)::text`,
        available_balance: sql<string>`coalesce(${wallets.availableBalance}, 0)::text`,
        created_at: users.createdAt,
      })
      .from(users)
      .leftJoin(wallets, eq(wallets.userId, users.id))
      .where(ne(users.role, "ADMIN"))
      .orderBy(desc(users.createdAt))
      .limit(100),
    db
      .select({
        id: transactions.id,
        user_id: transactions.userId,
        first_name: users.firstName,
        last_name: users.lastName,
        email: users.email,
        amount: transactions.amount,
        reference_id: transactions.referenceId,
        metadata: transactions.metadata,
        created_at: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(users, eq(users.id, transactions.userId))
      .where(
        and(
          eq(transactions.transactionType, "WITHDRAWAL"),
          eq(transactions.status, "PENDING"),
        ),
      )
      .orderBy(desc(transactions.createdAt))
      .limit(50),
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        actor_email: users.email,
        created_at: auditLogs.createdAt,
      })
      .from(auditLogs)
      .innerJoin(users, eq(users.id, auditLogs.userId))
      .where(like(auditLogs.action, "ADMIN_%"))
      .orderBy(desc(auditLogs.createdAt))
      .limit(12),
  ]);

  const serializedUsers: AdminUserRow[] = recentUsers.map((user) => ({
    ...user,
    created_at: user.created_at.toISOString(),
  }));

  const serializedWithdrawals: AdminWithdrawalRow[] = pendingWithdrawalRows.map(
    (withdrawal) => {
      const metadata =
        withdrawal.metadata &&
        typeof withdrawal.metadata === "object" &&
        !Array.isArray(withdrawal.metadata)
          ? (withdrawal.metadata as Record<string, unknown>)
          : {};

      return {
        id: withdrawal.id,
        user_id: withdrawal.user_id,
        user_name: `${withdrawal.first_name} ${withdrawal.last_name}`,
        email: withdrawal.email,
        amount: withdrawal.amount,
        reference_id: withdrawal.reference_id,
        network:
          typeof metadata.network === "string" ? metadata.network : "Unknown",
        destination_address:
          typeof metadata.destinationAddress === "string"
            ? metadata.destinationAddress
            : "Unavailable",
        created_at: withdrawal.created_at.toISOString(),
      };
    },
  );

  const serializedAudit: AdminAuditRow[] = recentAuditRows.map((entry) => ({
    ...entry,
    created_at: entry.created_at.toISOString(),
  }));

  return (
    <AdminDashboard
      admin={admin}
      metrics={{
        users: totalUsers,
        activeUsers,
        pendingKyc,
        linkedAccounts,
        pendingWithdrawals,
        walletBalance,
      }}
      initialUsers={serializedUsers}
      initialWithdrawals={serializedWithdrawals}
      recentAudit={serializedAudit}
    />
  );
}
