"use client";

import React, { useState } from "react";
import Breadcrum from "@/src/components/shared/Breadcrum";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";
import { useUser } from "@/src/lib/hooks/useUser";

interface OpenTradePosition {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl?: number;
  tp?: number;
  floatingPL: number;
  openTime: string;
}

const SAMPLE_POSITIONS: OpenTradePosition[] = [
  {
    id: "POS-98124",
    symbol: "XAUUSD",
    type: "BUY",
    lots: 1.5,
    openPrice: 2485.4,
    currentPrice: 2498.2,
    sl: 2470.0,
    tp: 2520.0,
    floatingPL: 1920.0,
    openTime: "2026-08-31 08:30:15",
  },
  {
    id: "POS-98125",
    symbol: "EURUSD",
    type: "BUY",
    lots: 2.0,
    openPrice: 1.0845,
    currentPrice: 1.0872,
    sl: 1.081,
    tp: 1.092,
    floatingPL: 540.0,
    openTime: "2026-08-31 09:12:40",
  },
  {
    id: "POS-98126",
    symbol: "GBPUSD",
    type: "SELL",
    lots: 1.0,
    openPrice: 1.298,
    currentPrice: 1.2945,
    sl: 1.302,
    tp: 1.289,
    floatingPL: 350.0,
    openTime: "2026-08-31 09:45:00",
  },
  {
    id: "POS-98127",
    symbol: "BTCUSD",
    type: "BUY",
    lots: 0.25,
    openPrice: 63400.0,
    currentPrice: 64150.0,
    sl: 62000.0,
    tp: 66000.0,
    floatingPL: 187.5,
    openTime: "2026-08-31 10:05:22",
  },
];

export default function AnalyticsPage() {
  const { data: userData } = useUser();
  const user = userData?.data?.user;

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced("Just now");
    }, 1200);
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const totalFloatingPL = SAMPLE_POSITIONS.reduce(
    (sum, pos) => sum + pos.floatingPL,
    0,
  );
  const totalOpenLots = SAMPLE_POSITIONS.reduce(
    (sum, pos) => sum + pos.lots,
    0,
  );

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      {/* ─── Top Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Breadcrum />
          <h1 className="text-secondary text-lg font-medium font-clash-display mt-1">
            Trading & Broker Analytics
          </h1>
          <p className="text-secondary/60 text-xs">
            Real-time execution analytics, floating P/L, open trading positions, and RoboForex ECN synchronization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-[4px] border border-secondary/8 bg-primary/60 hover:bg-secondary/10 text-secondary text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`size-3.5 ${isSyncing ? "animate-spin text-accent" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>{isSyncing ? "Syncing..." : "Sync Broker"}</span>
          </button>
        </div>
      </div>

      {/* ─── Top Metric Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Balance & Equity */}
        <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 min-h-[140px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary/70">
              Account Equity
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-success/15 text-success font-mono text-[10px] font-semibold">
              +24.5% Net
            </span>
          </div>

          <div>
            <div className="font-clash-display text-2xl sm:text-3xl font-semibold text-secondary">
              ${formatCurrency(12450.0, 2)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-secondary/50 font-mono">
              <span>Balance: ${formatCurrency(10000.0, 2)}</span>
              <span>USD</span>
            </div>
          </div>
        </div>

        {/* Card 2: Floating P/L */}
        <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 min-h-[140px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary/70">
              Floating P/L
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-success/15 text-success font-mono text-[10px] font-semibold">
              {SAMPLE_POSITIONS.length} Trades Active
            </span>
          </div>

          <div>
            <div className="font-clash-display text-2xl sm:text-3xl font-semibold text-success">
              +${formatCurrency(totalFloatingPL, 2)}
            </div>
            <span className="text-[11px] text-secondary/50 mt-1 block font-mono">
              Open Volume: {totalOpenLots.toFixed(2)} Lots
            </span>
          </div>
        </div>

        {/* Card 3: Margin & Free Margin */}
        <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 min-h-[140px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary/70">
              Free Margin
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-accent/15 text-accent font-mono text-[10px] font-semibold">
              91.4% Level
            </span>
          </div>

          <div>
            <div className="font-clash-display text-2xl sm:text-3xl font-semibold text-secondary">
              ${formatCurrency(11200.0, 2)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-secondary/50 font-mono">
              <span>Margin Used: ${formatCurrency(1250.0, 2)}</span>
              <span>1:500</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Lots & Volume */}
        <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 min-h-[140px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary/70">
              Total Lots Traded
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-secondary/10 text-secondary font-mono text-[10px] font-semibold">
              All Time
            </span>
          </div>

          <div>
            <div className="font-clash-display text-2xl sm:text-3xl font-semibold text-secondary">
              48.50 Lots
            </div>
            <span className="text-[11px] text-secondary/50 mt-1 block font-mono">
              Volume: ${formatCurrency(125000.0, 2)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Broker Connection Information Banner ─────────────────────── */}
      <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="size-10 rounded-[3px] bg-accent/15 text-accent flex items-center justify-center font-bold text-sm">
            RBX
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary font-clash-display">
                RoboForex ECN-Pro
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-semibold bg-success/15 text-success border border-success/20">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                CONNECTED
              </span>
            </div>
            <span className="text-xs text-secondary/60 font-mono">
              Account ID: {user?.roboforex_id || "RBX-884129"} • Server: RoboForex-ECN-01 • Leverage 1:500
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-secondary/60">
          <span>Last Synced: <span className="font-mono text-secondary">{lastSynced}</span></span>
        </div>
      </div>

      {/* ─── Open Positions Live Ledger Table ─────────────────────────── */}
      <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary/6 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold font-clash-display text-secondary">
              Open Trading Positions
            </h2>
            <p className="text-xs text-secondary/60">
              Live market execution synced directly from the RoboForex trading terminal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-secondary/70">
              Total Floating: <span className="font-semibold text-success">+${formatCurrency(totalFloatingPL, 2)}</span>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-secondary/6 text-secondary/50 font-medium pb-2">
                <th className="py-2.5 px-3">Position ID</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Lots</th>
                <th className="py-2.5 px-3">Open Price</th>
                <th className="py-2.5 px-3">Current Price</th>
                <th className="py-2.5 px-3">SL / TP</th>
                <th className="py-2.5 px-3 text-right">Floating P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/4">
              {SAMPLE_POSITIONS.map((pos) => {
                const isPositive = pos.floatingPL >= 0;
                return (
                  <tr
                    key={pos.id}
                    className="hover:bg-secondary/3 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-secondary/70">
                      <button
                        type="button"
                        onClick={() => handleCopy(pos.id, pos.id)}
                        className="inline-flex items-center gap-1 hover:text-accent cursor-pointer group"
                      >
                        <span>{pos.id}</span>
                        <span className="text-[10px] opacity-60 group-hover:opacity-100">
                          {copiedId === pos.id ? "✓" : "📋"}
                        </span>
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold font-mono text-secondary">
                        {pos.symbol}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${
                          pos.type === "BUY"
                            ? "bg-success/15 text-success border border-success/20"
                            : "bg-error/15 text-error border border-error/20"
                        }`}
                      >
                        {pos.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-secondary">
                      {pos.lots.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 font-mono text-secondary/70">
                      {pos.openPrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-mono text-secondary font-medium">
                      {pos.currentPrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-mono text-secondary/50 text-[11px]">
                      {pos.sl ? pos.sl.toLocaleString() : "—"} / {pos.tp ? pos.tp.toLocaleString() : "—"}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-semibold font-mono text-sm ${
                          isPositive ? "text-success" : "text-error"
                        }`}
                      >
                        {isPositive ? "+" : ""}${formatCurrency(pos.floatingPL, 2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
