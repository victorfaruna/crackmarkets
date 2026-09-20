"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardBrand from "@/src/components/layout/DashboardBrand";

export interface AdminUserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country: string;
  referral_code: string;
  role: string;
  status: string;
  kyc_status: string;
  funding_status: string;
  roboforex_linked: boolean;
  roboforex_id: string | null;
  wallet_balance: string;
  available_balance: string;
  created_at: string;
}

export interface AdminWithdrawalRow {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  amount: string;
  reference_id: string | null;
  network: string;
  destination_address: string;
  created_at: string;
}

export interface AdminAuditRow {
  id: string;
  action: string;
  actor_email: string;
  created_at: string;
}

interface AdminDashboardProps {
  admin: { firstName: string; lastName: string; email: string };
  metrics: {
    users: number;
    activeUsers: number;
    pendingKyc: number;
    linkedAccounts: number;
    pendingWithdrawals: number;
    walletBalance: string;
  };
  initialUsers: AdminUserRow[];
  initialWithdrawals: AdminWithdrawalRow[];
  recentAudit: AdminAuditRow[];
}

type EditableField = "role" | "status" | "kyc_status" | "funding_status";
type Notice = { type: "success" | "error"; text: string } | null;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const date = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function statusColor(value: string) {
  if (["ACTIVE", "APPROVED", "UNLOCKED"].includes(value)) return "select-success";
  if (["SUSPENDED", "REJECTED"].includes(value)) return "select-error";
  return "select-warning";
}

function actionLabel(action: string) {
  return action.replace(/^ADMIN_/, "").replaceAll("_", " ").toLowerCase();
}

export default function AdminDashboard({
  admin,
  metrics,
  initialUsers,
  initialWithdrawals,
  recentAudit,
}: AdminDashboardProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(
    metrics.pendingWithdrawals,
  );
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !needle ||
        `${user.first_name} ${user.last_name} ${user.email} ${user.country} ${user.referral_code}`
          .toLowerCase()
          .includes(needle);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  async function updateUser(userId: string, field: EditableField, value: string) {
    const selected = users.find((user) => user.id === userId);
    if (
      field === "status" &&
      value === "SUSPENDED" &&
      !window.confirm(`Suspend ${selected?.email || "this account"} and revoke its sessions?`)
    ) {
      return;
    }

    setBusy(`${userId}:${field}`);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: Partial<AdminUserRow> & { id: string };
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || "Update failed.");
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, ...payload.data } : user,
        ),
      );
      setNotice({ type: "success", text: payload.message || "Account updated." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update the account.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function runUserAction(user: AdminUserRow, action: "sessions" | "broker") {
    const isBroker = action === "broker";
    const question = isBroker
      ? `Unlink the broker account for ${user.email}? Funding will be locked.`
      : `Revoke every active session for ${user.email}?`;
    if (!window.confirm(question)) return;

    setBusy(`${user.id}:${action}`);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/${action}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: { roboforex_linked: false; funding_status: "LOCKED" };
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Action failed.");
      }
      if (payload.data) {
        setUsers((current) =>
          current.map((record) =>
            record.id === user.id ? { ...record, ...payload.data } : record,
          ),
        );
      }
      setNotice({ type: "success", text: payload.message || "Action completed." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to complete the action.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function reverseWithdrawal(withdrawal: AdminWithdrawalRow) {
    const reason = window.prompt(
      `Why should ${withdrawal.reference_id || "this withdrawal"} be reversed?`,
    )?.trim();
    if (!reason) return;
    if (!window.confirm("Return the reserved funds to the user's available balance?")) return;

    setBusy(`withdrawal:${withdrawal.id}`);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVERSED", reason }),
      });
      const payload = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to reverse withdrawal.");
      }
      setWithdrawals((current) => current.filter((item) => item.id !== withdrawal.id));
      setPendingWithdrawalCount((current) => Math.max(0, current - 1));
      setNotice({ type: "success", text: payload.message || "Withdrawal reversed." });
      router.refresh();
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to reverse withdrawal.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const stats = [
    ["Total users", metrics.users.toLocaleString(), "Registered accounts"],
    ["Active", metrics.activeUsers.toLocaleString(), "Enabled accounts"],
    ["Pending KYC", metrics.pendingKyc.toLocaleString(), "Awaiting review"],
    ["Broker linked", metrics.linkedAccounts.toLocaleString(), "Verified links"],
    ["Withdrawals", pendingWithdrawalCount.toLocaleString(), "Pending requests"],
    ["Wallet balances", money.format(Number(metrics.walletBalance) || 0), "Platform total"],
  ];

  return (
    <main className="min-h-screen w-full min-w-0 bg-primary/30 text-secondary">
      <header className="navbar sticky top-0 z-30 min-h-16 bg-shell-background px-4 text-on-dark sm:px-6">
        <div className="navbar-start">
          <DashboardBrand size={34} />
          <span className="ml-4 hidden border-l border-on-dark/20 pl-4 text-sm text-on-dark/60 sm:block">
            Administration
          </span>
        </div>
        <div className="navbar-end gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">{admin.firstName} {admin.lastName}</p>
            <p className="text-xs text-on-dark/60">{admin.email}</p>
          </div>
          <button className="btn btn-sm border-on-dark/20 bg-on-dark/5 text-on-dark hover:bg-on-dark/10" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">Operations</p>
            <h1 className="mt-1 text-2xl font-semibold">Admin command center</h1>
            <p className="mt-1 text-sm text-subtext">Accounts, access, KYC, broker links, and payout exceptions.</p>
          </div>
          <nav className="flex gap-2 text-sm">
            <a className="btn btn-sm btn-ghost" href="#users">Users</a>
            <a className="btn btn-sm btn-ghost" href="#withdrawals">Withdrawals</a>
            <a className="btn btn-sm btn-ghost" href="#audit">Audit</a>
          </nav>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {stats.map(([label, value, description]) => (
            <div key={label} className="stats border border-secondary/10 bg-background shadow-none">
              <div className="stat p-4">
                <div className="stat-title text-xs text-subtext">{label}</div>
                <div className="stat-value my-1 text-xl text-secondary">{value}</div>
                <div className="stat-desc text-subtext">{description}</div>
              </div>
            </div>
          ))}
        </section>

        {notice ? (
          <div role="alert" className={`alert alert-soft text-sm ${notice.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{notice.text}</span>
          </div>
        ) : null}

        <section id="withdrawals" className="card card-border border-secondary/10 bg-background">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-5 pt-5">
              <div>
                <h2 className="card-title text-base">Pending withdrawals</h2>
                <p className="text-xs text-subtext">Funds can be returned here. Completion requires the verified payout integration.</p>
              </div>
              <span className="badge badge-warning badge-soft">{pendingWithdrawalCount} pending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="text-subtext">
                  <tr className="border-secondary/10">
                    <th>User</th><th>Request</th><th>Destination</th><th>Created</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-secondary/10">
                      <td><p className="font-medium">{withdrawal.user_name}</p><p className="text-xs text-subtext">{withdrawal.email}</p></td>
                      <td><p className="font-semibold">{money.format(Number(withdrawal.amount))}</p><p className="font-mono text-xs text-subtext">{withdrawal.reference_id}</p></td>
                      <td><p className="text-xs font-medium">{withdrawal.network}</p><p className="max-w-52 truncate font-mono text-xs text-subtext" title={withdrawal.destination_address}>{withdrawal.destination_address}</p></td>
                      <td className="whitespace-nowrap text-xs text-subtext">{date.format(new Date(withdrawal.created_at))}</td>
                      <td><button className="btn btn-error btn-soft btn-xs" disabled={busy === `withdrawal:${withdrawal.id}`} onClick={() => reverseWithdrawal(withdrawal)}>Return funds</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!withdrawals.length ? <p className="px-5 py-10 text-center text-sm text-subtext">No pending withdrawals.</p> : null}
            </div>
          </div>
        </section>

        <section id="users" className="card card-border border-secondary/10 bg-background">
          <div className="card-body gap-4 p-0">
            <div className="flex flex-col gap-3 px-4 pt-5 lg:flex-row lg:items-end lg:justify-between lg:px-5">
              <div>
                <h2 className="card-title text-base">User administration</h2>
                <p className="text-xs text-subtext">The 100 newest non-admin accounts are shown.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input className="input input-sm w-full border-secondary/15 bg-primary/30 sm:w-64" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" aria-label="Search users" />
                <select className="select select-sm border-secondary/15 bg-primary/30" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role"><option value="ALL">All roles</option><option value="USER">Users</option><option value="SUPPORT">Support</option></select>
                <select className="select select-sm border-secondary/15 bg-primary/30" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by account status"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="text-subtext">
                  <tr className="border-secondary/10"><th>User</th><th>Wallet</th><th>Role</th><th>Broker</th><th>Account</th><th>KYC</th><th>Funding</th><th></th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-secondary/10 align-top">
                      <td>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-subtext">{user.email}</p>
                        <p className="text-xs text-subtext">{user.country} · {user.referral_code}</p>
                      </td>
                      <td><p className="font-medium">{money.format(Number(user.wallet_balance))}</p><p className="text-xs text-subtext">{money.format(Number(user.available_balance))} available</p></td>
                      <td><select className="select select-xs" value={user.role} disabled={busy === `${user.id}:role`} onChange={(event) => updateUser(user.id, "role", event.target.value)}><option value="USER">User</option><option value="SUPPORT">Support</option></select></td>
                      <td><span className={`badge badge-sm badge-soft ${user.roboforex_linked ? "badge-success" : "badge-ghost"}`}>{user.roboforex_linked ? user.roboforex_id || "Linked" : "Not linked"}</span></td>
                      <td><select className={`select select-xs ${statusColor(user.status)}`} value={user.status} disabled={busy === `${user.id}:status`} onChange={(event) => updateUser(user.id, "status", event.target.value)}><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></td>
                      <td><select className={`select select-xs ${statusColor(user.kyc_status)}`} value={user.kyc_status} disabled={busy === `${user.id}:kyc_status`} onChange={(event) => updateUser(user.id, "kyc_status", event.target.value)}><option value="NOT_SUBMITTED">Not submitted</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></td>
                      <td><select className={`select select-xs ${statusColor(user.funding_status)}`} value={user.funding_status} disabled={busy === `${user.id}:funding_status`} onChange={(event) => updateUser(user.id, "funding_status", event.target.value)}><option value="LOCKED">Locked</option><option value="UNLOCKED">Unlocked</option></select></td>
                      <td>
                        <details className="dropdown dropdown-end">
                          <summary className="btn btn-ghost btn-xs">Actions</summary>
                          <ul className="menu dropdown-content z-20 mt-1 w-48 rounded-box border border-secondary/10 bg-background p-2 shadow-xl">
                            <li><button disabled={busy === `${user.id}:sessions`} onClick={() => runUserAction(user, "sessions")}>Revoke sessions</button></li>
                            <li><button disabled={!user.roboforex_linked || busy === `${user.id}:broker`} onClick={() => runUserAction(user, "broker")}>Unlink broker</button></li>
                          </ul>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredUsers.length ? <p className="px-5 py-10 text-center text-sm text-subtext">No matching users.</p> : null}
            </div>
          </div>
        </section>

        <section id="audit" className="card card-border border-secondary/10 bg-background">
          <div className="card-body gap-4 p-5">
            <div><h2 className="card-title text-base">Recent admin activity</h2><p className="text-xs text-subtext">Latest security and account operations.</p></div>
            <div className="divide-y divide-secondary/10">
              {recentAudit.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div><p className="capitalize">{actionLabel(entry.action)}</p><p className="text-xs text-subtext">{entry.actor_email}</p></div>
                  <time className="whitespace-nowrap text-xs text-subtext">{date.format(new Date(entry.created_at))}</time>
                </div>
              ))}
              {!recentAudit.length ? <p className="py-6 text-center text-sm text-subtext">No admin activity recorded.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
