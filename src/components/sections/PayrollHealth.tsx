"use client";

import React from "react";
import Link from "next/link";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { useImpressions } from "@/src/lib/hooks/useImpressions";

export const PayrollHealthCard = () => {
  const { data: serverData, isLoading } = useImpressions();
  const impressions = serverData?.data;

  const totalClicks = impressions?.totalClicks ?? 0;
  const growthLabel = impressions?.growthLabel ?? "Active";
  const rawSparkline = impressions?.sparkline || [];

  // Prepare chart data ensuring bars are visible even with 0 counts
  const chartData =
    rawSparkline.length > 0
      ? rawSparkline.map((d) => ({
          v: d.v > 0 ? d.v : 2, // baseline height so bars render visually
          realCount: d.v,
        }))
      : Array.from({ length: 30 }).map(() => ({ v: 2, realCount: 0 }));

  const hasActivity = totalClicks > 0;

  return (
    <div className="item-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-secondary/90 text-sm leading-none font-medium">
            Impressions
          </p>

          <span className="inline-flex items-center gap-1.5 font-medium text-subtext text-sm mt-0.5">
            <span className={`size-1.5 rounded-full ${hasActivity ? "bg-success" : "bg-secondary/40"}`} />
            {isLoading ? "Syncing..." : growthLabel}
          </span>
        </div>

        <Link
          href="/dashboard/network"
          data-tip="Network Traffic"
          aria-label="Network Traffic"
          className="tooltip tooltip-left size-7 rounded-full bg-secondary/0 hover:bg-secondary/5 flex items-center justify-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 text-secondary/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </Link>
      </div>

      {/* Sparkline bar chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={2} barGap={3}>
            <Bar dataKey="v" radius={[999, 999, 999, 999]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === chartData.length - 1 && hasActivity
                      ? "var(--accent)"
                      : i % 2 === 0
                      ? "var(--subtext)"
                      : "var(--secondary)"
                  }
                  fillOpacity={hasActivity ? 1 : 0.25}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-secondary/60 leading-relaxed">
          <span className="text-secondary font-medium">
            {totalClicks.toLocaleString()} {totalClicks === 1 ? "click" : "clicks"}
          </span>{" "}
          across your referral links
        </p>

        <Link
          href="/dashboard/network"
          className="text-secondary/70 hover:text-secondary underline flex items-center gap-1 transition-colors"
        >
          more info
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-3"
          >
            <path
              fillRule="evenodd"
              d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default PayrollHealthCard;
