"use client";

import React, { useState, useMemo } from "react";
import Breadcrum from "@/src/components/shared/Breadcrum";
import CurrencyPill from "@/src/components/shared/CurrencyPill";
import { useUser } from "@/src/lib/hooks/useUser";
import { useWalletTransactions } from "@/src/lib/hooks/useWallet";
import { useAppStore } from "@/src/lib/stores/appStore";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";
import { TransactionItem, TransactionType } from "@/src/lib/services/wallet";

const TYPE_TABS = [
  { id: "ALL", label: "All Transactions" },
  { id: "COMMISSION", label: "Commissions" },
  { id: "WITHDRAWAL", label: "Withdrawals" },
  { id: "DEPOSIT", label: "Deposits" },
];

const STATUS_OPTIONS = [
  { id: "ALL", label: "All Statuses" },
  { id: "COMPLETED", label: "Completed" },
  { id: "PENDING", label: "Pending" },
  { id: "FAILED", label: "Failed" },
];

function getTransactionMetadata(type: TransactionType, level: number | null) {
  switch (type) {
    case "COMMISSION_BONUS_1":
      return {
        label: level ? `Level ${level} Referral Profit (5%)` : "Referral Profit Commission",
        iconType: "inbound",
        color: "text-success",
        badge: "Profit Share",
      };
    case "LOT_BONUS_2":
      return {
        label: level ? `Level ${level} Lot Bonus ($${level <= 3 ? "2.00" : level === 4 ? "1.00" : "0.50"}/lot)` : "Lot Distribution Bonus",
        iconType: "inbound",
        color: "text-success",
        badge: "Lot Bonus",
      };
    case "STRONG_LEG_BONUS_3":
      return {
        label: "Team Strong Leg Volume Bonus",
        iconType: "inbound",
        color: "text-accent",
        badge: "Strong Leg",
      };
    case "VOLUME_BONUS_4":
      return {
        label: level ? `Tier ${level} Volume Ladder Bonus` : "Volume Ladder Bonus",
        iconType: "inbound",
        color: "text-accent",
        badge: "Ladder Tier",
      };
    case "LEADERSHIP_REWARD":
      return {
        label: "Leadership Pool Payout",
        iconType: "inbound",
        color: "text-accent",
        badge: "Pool Reward",
      };
    case "WITHDRAWAL":
      return {
        label: "USDT Wallet Withdrawal",
        iconType: "outbound",
        color: "text-secondary",
        badge: "Withdrawal",
      };
    case "DEPOSIT":
      return {
        label: "RoboForex Trading Deposit Sync",
        iconType: "inbound",
        color: "text-success",
        badge: "Broker Deposit",
      };
    default:
      return {
        label: "Wallet Transaction",
        iconType: "neutral",
        color: "text-secondary",
        badge: "Transaction",
      };
  }
}

export default function WalletPage() {
  const setWalletDrawerOpen = useAppStore((s) => s.setWalletDrawerOpen);
  const { data: userData } = useUser();

  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: txResponse, isLoading, refetch } = useWalletTransactions({
    type: selectedType !== "ALL" ? selectedType : undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    search: search.trim() || undefined,
  });

  const walletSummary = txResponse?.data?.wallet || {
    balance: userData?.data?.wallet?.balance || "0.00",
    available_balance: userData?.data?.wallet?.available_balance || "0.00",
    total_withdrawn: userData?.data?.wallet?.total_withdrawn || "0.00",
    lifetime_earnings: userData?.data?.wallet?.lifetime_earnings || "0.00",
  };

  const rawAvailable = parseFloat(walletSummary.available_balance) || 0;
  const rawLifetime = parseFloat(walletSummary.lifetime_earnings) || 0;
  const rawWithdrawn = parseFloat(walletSummary.total_withdrawn) || 0;

  const formattedAvailable = formatCurrency(rawAvailable, 2);
  const [integerPart, decimalPart] = formattedAvailable.split(".");

  const transactions = txResponse?.data?.transactions || [];

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      {/* ─── Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Breadcrum />
          <h1 className="text-secondary text-lg font-medium font-clash-display mt-1">
            Wallet & Transactions
          </h1>
          <p className="text-secondary/60 text-xs">
            Manage your referral commission payouts, available USDT balance, and live ledger transaction history.
          </p>
        </div>

        {/* Header Action CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setWalletDrawerOpen(true)}
            className="px-4 py-2 rounded-xl bg-accent text-background font-semibold text-xs hover:bg-accent/90 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-3.5"
            >
              <path
                d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Withdraw Commission
          </button>
        </div>
      </div>

      {/* ─── Top Balance & Metrics Cards Grid ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Available Balance Card */}
        <div className="md:col-span-2 rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col justify-between gap-5 relative overflow-hidden shadow-xs">
          {/* Subtle background decoration */}
          <div className="absolute z-0 inset-0 bg-[url(/images/card-mesh.webp)] bg-size-[300%] bg-no-repeat opacity-15 pointer-events-none" />

          <div className="flex flex-col gap-4 relative z-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyPill
                  currencyName="USDT"
                  currencyUrl="/images/stablecoins/usdt.png"
                />
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/25">
                  Instant Settlement
                </span>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="size-7 rounded-lg border border-secondary/10 bg-primary hover:bg-secondary/10 flex items-center justify-center text-secondary/60 hover:text-secondary transition-colors cursor-pointer"
                title="Refresh balance"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>

            <div>
              <p className="text-secondary/50 font-medium text-xs">
                Available Commission Balance
              </p>
              <div className="font-clash-display flex items-end text-3xl sm:text-4xl font-semibold text-secondary mt-1">
                <span className="text-2xl text-secondary/60 mr-1 leading-none">
                  $
                </span>
                <span className="leading-none">{integerPart}</span>
                <span className="text-xl text-subtext leading-none">
                  .{decimalPart || "00"}
                </span>
                <span className="text-xs font-mono font-normal text-secondary/50 ml-2 mb-0.5">
                  USDT
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-secondary/10 flex flex-wrap items-center justify-between gap-3 relative z-1">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-secondary/50 block text-[11px]">
                  Lifetime Earnings
                </span>
                <span className="font-semibold text-secondary font-mono">
                  ${formatCurrency(rawLifetime, 2)}
                </span>
              </div>
              <div className="h-6 w-px bg-secondary/10" />
              <div>
                <span className="text-secondary/50 block text-[11px]">
                  Total Withdrawn
                </span>
                <span className="font-semibold text-secondary font-mono">
                  ${formatCurrency(rawWithdrawn, 2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWalletDrawerOpen(true)}
              className="px-4 py-1.5 rounded-xl border border-secondary/15 bg-primary hover:bg-secondary/10 text-secondary text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Withdraw Now
            </button>
          </div>
        </div>

        {/* Side Metrics Card */}
        <div className="rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-secondary font-clash-display">
              Payout Summary
            </span>
            <p className="text-[11px] text-secondary/60">
              Direct crypto withdrawal via TRC-20, BEP-20, or ERC-20.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-primary/60 border border-secondary/10 flex items-center justify-between">
              <span className="text-xs text-secondary/70">Supported Networks</span>
              <span className="text-xs font-semibold text-accent font-mono">
                TRC20 • BEP20 • ERC20
              </span>
            </div>

            <div className="p-3 rounded-xl bg-primary/60 border border-secondary/10 flex items-center justify-between">
              <span className="text-xs text-secondary/70">Processing Speed</span>
              <span className="text-xs font-semibold text-success">
                Instant (1–5 min)
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-secondary/50 leading-relaxed">
            Commissions are generated automatically across 10 network levels from trading volume and profits.
          </div>
        </div>
      </div>

      {/* ─── Transaction History Section ──────────────────────────── */}
      <div className="rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold font-clash-display text-secondary">
              Transaction History
            </h2>
            <p className="text-xs text-secondary/60">
              Full ledger of commission distributions, bonuses, and withdrawal payouts.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search reference ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-sm bg-primary border border-secondary/15 text-secondary text-xs rounded-xl pl-8 pr-3 w-44 sm:w-52 focus:outline-none focus:border-accent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select select-sm bg-primary border border-secondary/15 text-secondary text-xs rounded-xl focus:outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-secondary/10">
          {TYPE_TABS.map((tab) => {
            const active = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-secondary text-background font-semibold"
                    : "bg-primary/50 text-secondary/60 hover:text-secondary hover:bg-secondary/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Transactions Table / List */}
        {isLoading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl bg-primary/20 border border-secondary/10 animate-pulse"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-secondary/10 bg-primary/20 p-10 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl">📋</span>
            <span className="text-xs font-semibold text-secondary">
              No transactions found
            </span>
            <p className="text-[11px] text-secondary/60 max-w-xs">
              {search || selectedType !== "ALL" || selectedStatus !== "ALL"
                ? "No records match your search or filter parameters."
                : "Your account does not have any recorded transactions yet."}
            </p>
            {(search || selectedType !== "ALL" || selectedStatus !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedType("ALL");
                  setSelectedStatus("ALL");
                  setSearch("");
                }}
                className="mt-2 px-3 py-1 text-xs font-semibold rounded-lg bg-secondary text-background hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-secondary/10 text-secondary/50 font-medium pb-2">
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Reference / ID</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/5">
                {transactions.map((tx) => {
                  const meta = getTransactionMetadata(
                    tx.transaction_type,
                    tx.level,
                  );
                  const isPositive = tx.transaction_type !== "WITHDRAWAL";
                  const numAmount = parseFloat(tx.amount) || 0;
                  const dateObj = new Date(tx.created_at);
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-secondary/4 transition-colors"
                    >
                      {/* Transaction Description */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isPositive
                                ? "bg-success/15 text-success"
                                : "bg-secondary/10 text-secondary"
                            }`}
                          >
                            {isPositive ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-4"
                              >
                                <path d="M12 5v14" />
                                <path d="m19 12-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-4"
                              >
                                <path d="M12 19V5" />
                                <path d="m5 12 7-7 7 7" />
                              </svg>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <span className="font-semibold text-secondary">
                              {meta.label}
                            </span>
                            <span className="text-[10px] text-secondary/50">
                              {meta.badge}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reference / ID */}
                      <td className="py-3 px-3 font-mono text-[11px] text-secondary/70">
                        {tx.reference_id ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(tx.id, tx.reference_id || "")
                            }
                            className="inline-flex items-center gap-1 hover:text-accent cursor-pointer group"
                            title="Click to copy reference ID"
                          >
                            <span>{tx.reference_id}</span>
                            <span className="text-[10px] opacity-60 group-hover:opacity-100">
                              {copiedId === tx.id ? "✓" : "📋"}
                            </span>
                          </button>
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      {/* Tier / Level */}
                      <td className="py-3 px-3 font-medium">
                        {tx.level ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent/15 text-accent border border-accent/25">
                            Level {tx.level}
                          </span>
                        ) : (
                          <span className="text-secondary/40">—</span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 text-secondary/70">
                        <div className="flex flex-col">
                          <span>{formattedDate}</span>
                          <span className="text-[10px] text-secondary/40 font-mono">
                            {formattedTime}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            tx.status === "COMPLETED"
                              ? "bg-success/15 text-success border-success/25"
                              : tx.status === "PENDING"
                                ? "bg-accent/15 text-accent border-accent/25 animate-pulse"
                                : "bg-error/15 text-error border-error/25"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              tx.status === "COMPLETED"
                                ? "bg-success"
                                : tx.status === "PENDING"
                                  ? "bg-accent"
                                  : "bg-error"
                            }`}
                          />
                          {tx.status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-semibold font-mono text-sm ${
                            isPositive ? "text-success" : "text-secondary"
                          }`}
                        >
                          {isPositive ? "+" : "-"}${formatCurrency(numAmount, 2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
