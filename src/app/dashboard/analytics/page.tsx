"use client";

import React from "react";
import Breadcrum from "@/src/components/shared/Breadcrum";
import { useUser } from "@/src/lib/hooks/useUser";

const METRICS = [
  ["Account Equity", "Awaiting broker sync", "Authoritative broker value"],
  ["Floating P/L", "Awaiting broker sync", "No open-position feed available"],
  ["Free Margin", "Awaiting broker sync", "Margin data has not been imported"],
  ["Total Lots Traded", "Awaiting broker sync", "Broker volume is the source of truth"],
] as const;

export default function AnalyticsPage() {
  const { data: userData, isLoading } = useUser();
  const user = userData?.data?.user;
  const isLinked = user?.roboforex_linked === true;

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <Breadcrum />
        <h1 className="text-secondary text-lg font-medium font-inter mt-1">
          Trading & Broker Analytics
        </h1>
        <p className="text-secondary/60 text-sm">
          Broker balances, positions, and volume appear here only after an
          authoritative RoboForex synchronization.
        </p>
      </div>

      {!isLoading && (
        <div role="alert" className="alert alert-soft border border-secondary/10 bg-primary/40 text-secondary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="size-5 text-accent"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
            <path d="M12 11v5M12 8h.01" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-medium text-sm">
              {isLinked ? "Broker data has not been synchronized" : "RoboForex is not connected"}
            </p>
            <p className="text-sm text-secondary/60">
              {isLinked
                ? "No balances are shown until the broker integration supplies verified data."
                : "Complete KYC and verify your broker account from your profile to enable analytics."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {METRICS.map(([title, value, description]) => (
          <div
            className="stats stats-vertical rounded-lg border border-secondary/10 bg-primary/40 shadow-none"
            key={title}
          >
            <div className="stat p-5">
              <div className="stat-title text-secondary/70 text-sm">{title}</div>
              <div className="stat-value text-secondary text-base font-inter mt-4">
                {isLoading ? <span className="loading loading-dots loading-sm" /> : value}
              </div>
              <div className="stat-desc text-secondary/50 text-[11px] mt-1 whitespace-normal">
                {description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-secondary/10 bg-primary/40 p-5 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-secondary">RoboForex account</span>
          <span className={`badge badge-sm ${isLinked ? "badge-success" : "badge-ghost"}`}>
            {isLinked ? "Verified link" : "Not connected"}
          </span>
        </div>
        <p className="text-sm text-secondary/60 font-mono">
          Account ID: {user?.roboforex_id || "Not available"}
        </p>
      </div>

      <div className="rounded-lg border border-secondary/10 bg-primary/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold font-inter text-secondary">
          Open Trading Positions
        </h2>
        <p className="text-sm text-secondary/60 mt-1">
          No broker-synchronized positions are available.
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="table table-sm">
            <thead>
              <tr className="text-secondary/50">
                <th>Position ID</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th className="text-right">Floating P/L</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-10 text-center text-secondary/50">
                  Awaiting authoritative broker data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
