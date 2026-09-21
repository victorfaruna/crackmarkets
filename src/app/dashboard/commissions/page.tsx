"use client";

import React, { useState, useMemo } from "react";
import Breadcrum from "@/src/components/shared/Breadcrum";
import { useCommissions } from "@/src/lib/hooks/useCommissions";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

const TIME_TABS = ["Monthly", "Weekly", "All Time"] as const;

export default function CommissionsPage() {
  const [timeframe, setTimeframe] = useState<(typeof TIME_TABS)[number]>("Monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: commResponse, isLoading, isError } = useCommissions({
    timeframe: timeframe.toLowerCase(),
    month: timeframe === "Monthly" ? selectedMonth : undefined,
  });

  const preview = commResponse?.data?.preview || {
    profitShareWeekly: "0.00",
    lotCommissionWeekly: "0.00",
    cpaMonthly: "0.00",
    totalCommissions: "0.00",
  };

  const streams = commResponse?.data?.streams || [];
  const transactions = useMemo(
    () => commResponse?.data?.transactions || [],
    [commResponse?.data?.transactions],
  );

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "ALL") return transactions;
    return transactions.filter((t) => t.transaction_type === selectedFilter);
  }, [transactions, selectedFilter]);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["ID", "Type", "Level", "Amount", "Reference", "Status", "Date"];
    const rows = transactions.map((t) => [
      t.id,
      t.transaction_type,
      t.level || "",
      t.amount,
      t.reference_id || "",
      t.status,
      new Date(t.created_at).toISOString(),
    ]);

    const csvCell = (value: string | number) => {
      const text = String(value);
      const safe = /^[=+@-]/.test(text) ? `'${text}` : text;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.setAttribute("download", `commissions-report-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      {/* ─── Top Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Breadcrum />
          <h1 className="text-secondary text-lg font-medium font-inter mt-1">
            My Commissions Overview
          </h1>
          <p className="text-secondary/60 text-sm">
            Real-time breakdown of all 5 commission bonuses, income streams, and downline distributions.
          </p>
        </div>

        {/* Export / Action button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="px-4 py-2 rounded-[4px] border border-secondary/8 bg-primary/60 hover:bg-secondary/10 text-secondary text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* ─── Monthly Preview Top Cards (Taller Boxy Cards) ────────────── */}
      <div>
        <div className="flex flex-col gap-0.5 mb-2.5">
          <h2 className="text-sm font-semibold text-secondary font-inter">
            Monthly Preview
          </h2>
          <p className="text-[11px] text-secondary/50">
            Current period bonus distribution overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Profit Share (Weekly Preview) */}
          <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-6 flex flex-col justify-between gap-6 min-h-[175px] shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary/70">
                Profit Share (Weekly Preview)
              </span>
              <div className="size-7 rounded-[3px] bg-success/15 text-success flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-auto">
              {isLoading ? (
                <div className="skeleton w-36 h-9 rounded-[3px]" />
              ) : (
                <div className="font-inter text-3xl sm:text-4xl font-semibold text-secondary">
                  ${formatCurrency(parseFloat(preview.profitShareWeekly) || 0, 2)}
                </div>
              )}
              <span className="text-[11px] text-secondary/50 mt-1.5 block font-mono">
                Bonus 1 • 5% L1 down to 1% L10
              </span>
            </div>
          </div>

          {/* Card 2: LOT Commission (Weekly Preview) */}
          <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-6 flex flex-col justify-between gap-6 min-h-[175px] shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary/70">
                LOT Commission (Weekly Preview)
              </span>
              <div className="size-7 rounded-[3px] bg-accent/15 text-accent flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-auto">
              {isLoading ? (
                <div className="skeleton w-36 h-9 rounded-[3px]" />
              ) : (
                <div className="font-inter text-3xl sm:text-4xl font-semibold text-secondary">
                  ${formatCurrency(parseFloat(preview.lotCommissionWeekly) || 0, 2)}
                </div>
              )}
              <span className="text-[11px] text-secondary/50 mt-1.5 block font-mono">
                Bonus 2 • $2.00 to $0.50 / lot
              </span>
            </div>
          </div>

          {/* Card 3: CPA / Volume & Pools (Monthly Preview) */}
          <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-6 flex flex-col justify-between gap-6 min-h-[175px] shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary/70">
                Volume & Pools (Monthly Preview)
              </span>
              <div className="size-7 rounded-[3px] bg-secondary/15 text-secondary flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-auto">
              {isLoading ? (
                <div className="skeleton w-36 h-9 rounded-[3px]" />
              ) : (
                <div className="font-inter text-3xl sm:text-4xl font-semibold text-secondary">
                  ${formatCurrency(parseFloat(preview.cpaMonthly) || 0, 2)}
                </div>
              )}
              <span className="text-[11px] text-secondary/50 mt-1.5 block font-mono">
                Bonus 3, 4 & 5 • Strong Leg, Ladders & Pools
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── My Different Income Streams ────────────────────────────── */}
      <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
        {/* Header with timeframe controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary/6 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold font-inter text-secondary">
              My Different Income Streams
            </h2>
            <p className="text-sm text-secondary/60">
              Distribution in the selected timeframe across all bonus categories
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe selector */}
            <div className="flex items-center rounded-[3px] bg-primary border border-secondary/8 p-0.5">
              {TIME_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-sm font-medium rounded-[2px] transition-colors cursor-pointer ${
                    timeframe === t
                      ? "bg-secondary text-background font-semibold"
                      : "text-secondary/60 hover:text-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Month picker */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={timeframe !== "Monthly"}
              className="px-3 py-1 text-sm font-mono font-medium rounded-[3px] border border-secondary/8 bg-primary text-secondary focus:outline-none focus:border-accent cursor-pointer"
            />
          </div>
        </div>

        {/* 2-Column Grid of Income Streams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {streams.map((stream) => (
            <div
              key={stream.id}
              className="rounded-[3px] border border-secondary/6 bg-primary/60 p-4 min-h-[68px] flex items-center justify-between gap-3 hover:border-secondary/12 transition-colors"
            >
              {/* Left Side: Indicator Dot + Name + Frequency */}
              <div className="flex items-center gap-3 min-w-0">
                <span className={`size-2.5 rounded-[2px] shrink-0 ${stream.dotColor}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-secondary truncate">
                    {stream.name}
                  </span>
                  <span className="text-[10px] text-secondary/50 font-mono">
                    {stream.frequency} • {stream.bonusCode}
                  </span>
                </div>
              </div>

              {/* Right Side: Count + Amount (Percentage) */}
              <div className="flex items-center gap-2.5 shrink-0 text-right">
                <span className="px-2 py-0.5 rounded-[2px] bg-secondary/8 text-secondary font-mono text-[11px] font-semibold">
                  {stream.count}
                </span>

                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-secondary font-mono">
                    ${formatCurrency(parseFloat(stream.amount) || 0, 2)}
                  </span>
                  <span className="text-[10px] text-secondary/50 font-mono">
                    USDT
                  </span>
                  <span className="text-[10px] text-secondary/40 font-mono ml-0.5">
                    ({stream.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Recent Commission Distributions Table ──────────────────── */}
      <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold font-inter text-secondary">
              Recent Commission Distributions
            </h2>
            <p className="text-sm text-secondary/60">
              Live payouts credited to your commission wallet
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Bonuses" },
              { id: "COMMISSION_BONUS_1", label: "Profit Share" },
              { id: "LOT_BONUS_2", label: "Lot Rebate" },
              { id: "STRONG_LEG_BONUS_3", label: "Strong Leg" },
              { id: "VOLUME_BONUS_4", label: "Volume Ladder" },
              { id: "LEADERSHIP_REWARD", label: "Pools" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id)}
                className={`text-[11px] font-medium px-3 py-1 rounded-[3px] transition-colors whitespace-nowrap cursor-pointer ${
                  selectedFilter === f.id
                    ? "bg-secondary text-background font-semibold"
                    : "bg-primary border border-secondary/6 text-secondary/60 hover:text-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-14 rounded-[3px] bg-primary/20 border border-secondary/6 animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="alert alert-error alert-soft text-sm">
            Unable to load commission records. Please refresh and try again.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-[3px] border border-secondary/6 bg-primary/20 p-8 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl">📊</span>
            <span className="text-sm font-semibold text-secondary">
              No commission records found
            </span>
            <p className="text-[11px] text-secondary/60 max-w-xs">
              No distributions recorded for this selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-secondary/6 text-secondary/50 font-medium pb-2">
                  <th className="py-2.5 px-3">Bonus Type</th>
                  <th className="py-2.5 px-3">Reference ID</th>
                  <th className="py-2.5 px-3">Level Depth</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Credit Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/4">
                {filteredTransactions.map((tx) => {
                  const numAmt = parseFloat(tx.amount) || 0;
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
                      className="hover:bg-secondary/3 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-[1px] bg-success" />
                          <span className="font-semibold text-secondary">
                            {tx.transaction_type === "COMMISSION_BONUS_1"
                              ? "Profit Share (Bonus 1)"
                              : tx.transaction_type === "LOT_BONUS_2"
                                ? "Lot Distribution (Bonus 2)"
                                : tx.transaction_type === "STRONG_LEG_BONUS_3"
                                  ? "Strong Leg Volume (Bonus 3)"
                                  : tx.transaction_type === "VOLUME_BONUS_4"
                                    ? "Volume Ladder (Bonus 4)"
                                    : "Leadership Reward (Bonus 5)"}
                          </span>
                        </div>
                      </td>

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

                      <td className="py-3 px-3">
                        {tx.level ? (
                          <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20">
                            Level {tx.level}
                          </span>
                        ) : (
                          <span className="text-secondary/40">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-secondary/70">
                        <div className="flex flex-col">
                          <span>{formattedDate}</span>
                          <span className="text-[10px] text-secondary/40 font-mono">
                            {formattedTime}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-semibold border bg-success/15 text-success border-success/20">
                          <span className="size-1.5 rounded-full bg-success" />
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="font-semibold font-mono text-sm text-success">
                          +${formatCurrency(numAmt, 2)}
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
