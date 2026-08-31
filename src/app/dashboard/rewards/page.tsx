"use client";

import React, { useState } from "react";
import Breadcrum from "@/src/components/shared/Breadcrum";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

interface RewardPoolItem {
  id: string;
  title: string;
  category: string;
  rewardValue: string;
  description: string;
  criteria: string;
  requiredMonths: number;
  currentStreak: number;
  isQualified: boolean;
  tagColor: string;
}

const REWARD_POOLS: RewardPoolItem[] = [
  {
    id: "travel-benefit",
    title: "Travel Vacation Benefit",
    category: "Bonus 5 • Travel",
    rewardValue: "$2,000 Cash or Trip",
    description: "All-inclusive vacation package or instant cash payout to your commission wallet.",
    criteria: "Maintain $50,000 monthly team deposits for 3 consecutive months",
    requiredMonths: 3,
    currentStreak: 2,
    isQualified: false,
    tagColor: "bg-accent/15 text-accent border-accent/20",
  },
  {
    id: "leader-pool-1",
    title: "Leader Pool 1 — Family Vacation",
    category: "Bonus 5 • Luxury Pool",
    rewardValue: "Up to $15,000 Value",
    description: "Ultra-luxury international family getaway with premium flight and resort accommodations.",
    criteria: "Achieve and maintain Leader Tier for 2 consecutive qualification months",
    requiredMonths: 2,
    currentStreak: 2,
    isQualified: true,
    tagColor: "bg-success/15 text-success border-success/20",
  },
  {
    id: "leader-pool-2",
    title: "Leader Pool 2 — Luxury Car",
    category: "Bonus 5 • Vehicle Pool",
    rewardValue: "Up to $25,000 Vehicle",
    description: "Brand new vehicle delivery or equivalent USDT settlement to executive partners.",
    criteria: "Achieve Leader Tier 2 for 2 consecutive qualification months",
    requiredMonths: 2,
    currentStreak: 1,
    isQualified: false,
    tagColor: "bg-secondary/10 text-secondary border-secondary/15",
  },
  {
    id: "grand-estate",
    title: "Grand Prize — Prime Real Estate",
    category: "Bonus 5 • Estate Pool",
    rewardValue: "Up to $1,200,000 Estate",
    description: "Crown jewel leadership achievement: Luxury villa or penthouse estate ownership.",
    criteria: "Sustain executive tier qualification for 6 consecutive months",
    requiredMonths: 6,
    currentStreak: 2,
    isQualified: false,
    tagColor: "bg-accent/15 text-accent border-accent/20",
  },
];

const LADDER_TIERS = [
  { level: 1, volume: 10000, rate: "1.0%", isUnlocked: true, currentVolume: 125000 },
  { level: 2, volume: 50000, rate: "2.0%", isUnlocked: true, currentVolume: 125000 },
  { level: 3, volume: 200000, rate: "3.5%", isUnlocked: false, currentVolume: 125000 },
  { level: 4, volume: 1000000, rate: "5.0%", isUnlocked: false, currentVolume: 125000 },
  { level: 5, volume: 3500000, rate: "5.5%", isUnlocked: false, currentVolume: 125000 },
  { level: 6, volume: 8000000, rate: "6.0%", isUnlocked: false, currentVolume: 125000 },
  { level: 7, volume: 15000000, rate: "6.5%", isUnlocked: false, currentVolume: 125000 },
  { level: 8, volume: 30000000, rate: "7.0%", isUnlocked: false, currentVolume: 125000 },
  { level: 9, volume: 50000000, rate: "8.0%", isUnlocked: false, currentVolume: 125000 },
];

export default function RewardsPage() {
  const currentTotalVolume = 125000;
  const strongLegVolume = 68750;
  const weakLegVolume = 56250;

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      {/* ─── Top Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Breadcrum />
          <h1 className="text-secondary text-lg font-medium font-clash-display mt-1">
            Leadership Rewards & Incentives
          </h1>
          <p className="text-secondary/60 text-xs">
            Track milestone streaks, qualification progress, leader pools, and volume ladders across your organization.
          </p>
        </div>
      </div>

      {/* ─── 4 Leadership Pools Grid (Bonus 5) ─────────────────────────── */}
      <div>
        <div className="flex flex-col gap-0.5 mb-2.5">
          <h2 className="text-sm font-semibold text-secondary font-clash-display">
            Active Leadership Pools (Bonus 5)
          </h2>
          <p className="text-[11px] text-secondary/50">
            Sustain monthly qualifications to unlock luxury trips, car incentives, and estate rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {REWARD_POOLS.map((pool) => {
            const pct = Math.min(
              100,
              Math.round((pool.currentStreak / pool.requiredMonths) * 100),
            );

            return (
              <div
                key={pool.id}
                className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col justify-between gap-5 min-h-[220px] shadow-2xs relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] font-mono text-secondary/50 uppercase tracking-wider">
                      {pool.category}
                    </span>
                    <h3 className="text-base font-semibold text-secondary font-clash-display truncate">
                      {pool.title}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-[2px] text-[10px] font-semibold border shrink-0 ${pool.tagColor}`}
                  >
                    {pool.isQualified ? "QUALIFIED" : `${pool.currentStreak}/${pool.requiredMonths} Months`}
                  </span>
                </div>

                {/* Reward Value & Description */}
                <div className="flex flex-col gap-1">
                  <div className="text-xl sm:text-2xl font-bold font-clash-display text-secondary">
                    {pool.rewardValue}
                  </div>
                  <p className="text-xs text-secondary/60 leading-relaxed">
                    {pool.description}
                  </p>
                </div>

                {/* Progress Bar & Criteria */}
                <div className="flex flex-col gap-2 pt-2 border-t border-secondary/6">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-secondary/50">Streak Progress</span>
                    <span className="text-secondary font-semibold">
                      {pool.currentStreak} of {pool.requiredMonths} Months ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-[1px] bg-secondary/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        pool.isQualified ? "bg-success" : "bg-accent"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-secondary/40 italic">
                    Criteria: {pool.criteria}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Strong Leg Volume Bonus (Bonus 3) ─────────────────────────── */}
      <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary/6 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold font-clash-display text-secondary">
              Team Trading Volume Bonus (Bonus 3 — Strong Leg Rule)
            </h2>
            <p className="text-xs text-secondary/60">
              When your total team volume reaches $500,000 with a strong leg of $250,000, earn $1 per traded lot.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[2px] text-xs font-mono font-semibold bg-accent/15 text-accent border border-accent/20">
              Current Volume: ${formatCurrency(currentTotalVolume, 0)}
            </span>
          </div>
        </div>

        {/* 2-Column Tier Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Tier 1 Box */}
          <div className="rounded-[3px] border border-secondary/6 bg-primary/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary">
                Tier 1 Qualification
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-secondary/10 text-secondary/60">
                Target: $500,000
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono text-secondary/60">
                <span>Strong Leg Target: $250,000</span>
                <span>Current: ${formatCurrency(strongLegVolume, 0)} ({(strongLegVolume / 250000 * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-[1px] bg-secondary/10 overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.min(100, (strongLegVolume / 250000) * 100)}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] text-secondary/50">
              Reward: Strong Leg Lots × $1.00 USD cash credit
            </span>
          </div>

          {/* Tier 2 Box */}
          <div className="rounded-[3px] border border-secondary/6 bg-primary/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary">
                Tier 2 Qualification
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-secondary/10 text-secondary/60">
                Target: $1,000,000
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono text-secondary/60">
                <span>Strong Leg Target: $500,000</span>
                <span>Current: ${formatCurrency(strongLegVolume, 0)} ({(strongLegVolume / 500000 * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-[1px] bg-secondary/10 overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.min(100, (strongLegVolume / 500000) * 100)}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] text-secondary/50">
              Reward: Strong Leg Lots × $1.00 USD cash credit
            </span>
          </div>
        </div>
      </div>

      {/* ─── Percentage Level Bonus Ladder (Bonus 4) ──────────────────── */}
      <div className="rounded-[4px] border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary/6 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold font-clash-display text-secondary">
              Percentage Level Bonus Ladder (Bonus 4)
            </h2>
            <p className="text-xs text-secondary/60">
              Cumulative team volume threshold percentages from Level 1 (1.0%) up to Level 9 (8.0%).
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-[2px] text-xs font-mono font-semibold bg-success/15 text-success border border-success/20">
            Active Tier: Level 2 (2.0%)
          </span>
        </div>

        {/* 9-Tier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {LADDER_TIERS.map((tier) => {
            const isCurrent = tier.level === 2;
            return (
              <div
                key={tier.level}
                className={`rounded-[3px] border p-4 flex flex-col justify-between gap-2.5 transition-colors ${
                  tier.isUnlocked
                    ? "border-success/30 bg-success/5"
                    : isCurrent
                      ? "border-accent/40 bg-accent/5"
                      : "border-secondary/6 bg-primary/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-secondary">
                    Level {tier.level}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] ${
                      tier.isUnlocked
                        ? "bg-success/15 text-success"
                        : "bg-secondary/10 text-secondary/50"
                    }`}
                  >
                    {tier.isUnlocked ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="font-clash-display text-xl font-bold text-secondary">
                    {tier.rate}
                  </span>
                  <span className="font-mono text-xs text-secondary/60">
                    ${formatCurrency(tier.volume, 0)} Vol
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
