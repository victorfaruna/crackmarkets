"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";
import { useNetwork } from "@/src/lib/hooks/useNetwork";
import { getUserPlaceholderImage } from "@/src/lib/utils/profileHandler";
import BinaryPlacementTree from "@/src/components/sections/network/BinaryPlacementTree";

const LEVELS = [
  { id: "ALL", label: "All Levels" },
  { id: 1, label: "Level 1 (5%)" },
  { id: 2, label: "Level 2 (4%)" },
  { id: 3, label: "Level 3 (3%)" },
  { id: 4, label: "Level 4 (2%)" },
  { id: 5, label: "Level 5 (2%)" },
  { id: 6, label: "Level 6 (2%)" },
  { id: 7, label: "Level 7 (2%)" },
  { id: 8, label: "Level 8 (2%)" },
  { id: 9, label: "Level 9 (2%)" },
  { id: 10, label: "Level 10 (1%)" },
];

const TIERS_SUMMARY = [
  { level: 1, rate: "5%", lots: "$2.00/lot" },
  { level: 2, rate: "4%", lots: "$2.00/lot" },
  { level: 3, rate: "3%", lots: "$2.00/lot" },
  { level: 4, rate: "2%", lots: "$1.00/lot" },
  { level: 5, rate: "2%", lots: "$0.50/lot" },
  { level: 6, rate: "2%", lots: "$0.50/lot" },
  { level: 7, rate: "2%", lots: "$0.50/lot" },
  { level: 8, rate: "2%", lots: "$0.50/lot" },
  { level: 9, rate: "2%", lots: "$0.50/lot" },
  { level: 10, rate: "1%", lots: "$0.50/lot" },
];

type ViewTab = "tree" | "directs" | "network" | "tiers";

function NetworkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const { data: serverUserData, isLoading: isUserLoading } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const user = serverUserData?.data?.user || storeUser;
  const referralCode = user?.referral_code || "";

  const { data: networkQueryData, isLoading, isError } = useNetwork();
  const networkData = networkQueryData?.data;
  const members = useMemo(() => networkData?.members || [], [networkData?.members]);
  const binaryMembers = useMemo(
    () => networkData?.binaryMembers || [],
    [networkData?.binaryMembers],
  );
  const totalCount = networkData?.totalMembers ?? 0;
  const totalDirects =
    networkData?.totalDirects ?? members.filter((m) => m.level === 1).length;
  const totalIndirects =
    networkData?.totalIndirects ?? members.filter((m) => m.level > 1).length;
  const activeCount = networkData?.activeCount ?? 0;

  const [copied, setCopied] = useState(false);
  const [selectedTab, setActiveTab] = useState<ViewTab>("tree");
  const [selectedLevel, setSelectedLevel] = useState<string | number>("ALL");
  const [search, setSearch] = useState("");

  const activeTab: ViewTab =
    viewParam === "global"
      ? "network"
      : viewParam === "top" || viewParam === "directs"
        ? "directs"
        : selectedTab;

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";

  const referralLink = referralCode
    ? `${appUrl}/register?ref=${referralCode}`
    : appUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directMembers = useMemo(
    () => members.filter((m) => m.level === 1),
    [members],
  );

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchLevel =
        selectedLevel === "ALL" || m.level === Number(selectedLevel);
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.country.toLowerCase().includes(search.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [members, selectedLevel, search]);

  const filteredDirects = useMemo(() => {
    return directMembers.filter((m) => {
      return (
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.country.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [directMembers, search]);

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "My Account"
    : "My Account";

  if (isError) {
    return (
      <section className="w-full max-w-330 px-3 py-5 sm:px-5">
        <h1 className="text-lg font-medium text-secondary">Referral Network</h1>
        <p role="alert" className="mt-4 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
          The network is unavailable. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-3 pb-16 flex flex-col gap-4 sm:px-5">
      {/* ─── Top Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-secondary text-lg font-medium font-inter">
            Referral Network
          </h1>
          <p className="text-secondary/60 text-sm">
            {isLoading ? (
              "Loading referral lineage..."
            ) : (
              <>
                Total <span className="font-semibold text-secondary">{totalCount}</span> team members (
                <span className="text-accent font-semibold">{activeCount}</span> active) across your organization.
              </>
            )}
          </p>
        </div>

        {/* Referral Link Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-primary border border-secondary/10 rounded-full py-1.5 px-3 shadow-2xs">
            <span className="text-[0.7rem] text-secondary/60 font-medium">
              Referral Code:
            </span>
            <span className="text-sm font-mono font-medium text-accent">
              {referralCode || "—"}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[0.7rem] text-secondary/80 hover:text-secondary font-medium ml-1 cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Top Metrics Summary ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 min-h-40 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary/60 text-sm font-medium">Direct Referrals (L1)</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-accent/15 text-accent font-mono font-medium">
              5% Share
            </span>
          </div>
          <span className="text-3xl sm:text-4xl font-semibold font-inter text-secondary tracking-tight">
            {isLoading ? "—" : totalDirects}
          </span>
        </div>

        <div className="rounded-xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 min-h-40 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary/60 text-sm font-medium">Indirect Referrals (L2–L10)</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-secondary/10 text-secondary/70 font-mono">
              4%–1% Share
            </span>
          </div>
          <span className="text-3xl sm:text-4xl font-semibold font-inter text-secondary tracking-tight">
            {isLoading ? "—" : totalIndirects}
          </span>
        </div>

        <div className="rounded-xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 min-h-40 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary/60 text-sm font-medium">Total Referral Network</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-success/15 text-success font-mono font-medium">
              {activeCount} Active
            </span>
          </div>
          <span className="text-3xl sm:text-4xl font-semibold font-inter text-secondary tracking-tight">
            {isLoading ? "—" : totalCount}
          </span>
        </div>
      </div>

      {/* ─── System View Tabs & Controls ───────────────────────────────── */}
      <div className="w-full rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-secondary/10">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "tree" as ViewTab, label: "Binary Tree" },
              { id: "directs" as ViewTab, label: "Direct Referrals (L1)" },
              { id: "network" as ViewTab, label: "Total Network" },
              { id: "tiers" as ViewTab, label: "Tier Breakdown" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (viewParam) router.replace("/dashboard/network", { scroll: false });
                  }}
                  className={`text-[0.75rem] font-medium px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-secondary text-background font-semibold"
                      : "bg-secondary/5 text-secondary/70 hover:text-secondary hover:bg-secondary/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          {activeTab !== "tree" && (
            <div className="relative w-full md:w-64 shrink-0">
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8.5 pl-3.5 pr-8 rounded-xl border border-secondary/15 bg-background text-secondary text-sm placeholder:text-secondary/40 outline-hidden focus:border-accent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* ─── TAB 1: BINARY PLACEMENT TREE ────────────────────────────── */}
        {activeTab === "tree" && (
          <BinaryPlacementTree
            rootId={user?.id || ""}
            rootName={userName}
            members={binaryMembers}
            isLoading={isLoading || (isUserLoading && !user?.id)}
          />
        )}

        {/* ─── TAB 2: DIRECTS ONLY TABLE ───────────────────────────────── */}
        {activeTab === "directs" && (
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-secondary/50">Loading direct affiliates...</div>
            ) : filteredDirects.length === 0 ? (
              <div className="py-12 text-center text-sm text-secondary/50">No direct affiliates found.</div>
            ) : (
              filteredDirects.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 px-3 rounded-xl hover:bg-secondary/4 transition-colors border-b border-secondary/5 last:border-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      unoptimized
                      className="size-8 rounded-full bg-secondary/10 object-cover shrink-0 border border-secondary/15"
                      src={getUserPlaceholderImage(item.email || item.id)}
                      alt={item.name}
                      width={32}
                      height={32}
                    />
                    <div className="flex flex-col justify-center gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-secondary leading-none font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/15 text-accent">
                          Level 1 (5%)
                        </span>
                      </div>
                      <p className="text-secondary/50 text-[0.7rem] truncate font-mono">
                        {item.email} {item.country ? `• ${item.country}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.status === "ACTIVE"
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-secondary/10 text-secondary/60 border-secondary/20"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="hidden sm:inline text-sm text-secondary/50 font-mono">
                      {item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 3: TOTAL NETWORK (10-LEVEL DIRECTORY) ───────────────── */}
        {activeTab === "network" && (
          <div className="flex flex-col gap-3">
            {/* Level Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {LEVELS.map((lvl) => {
                const active = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`text-[0.75rem] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? "bg-secondary text-background font-semibold"
                        : "bg-secondary/5 text-secondary/70 hover:text-secondary hover:bg-secondary/10"
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>

            {/* Members List */}
            <div className="flex flex-col gap-2 pt-2">
              {isLoading ? (
                <div className="py-12 text-center text-sm text-secondary/50">Loading network members...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-12 text-center text-sm text-secondary/50">No network traders found.</div>
              ) : (
                filteredMembers.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-3 px-3 rounded-xl hover:bg-secondary/4 transition-colors border-b border-secondary/5 last:border-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        unoptimized
                        className="size-8 rounded-full bg-secondary/10 object-cover shrink-0 border border-secondary/15"
                        src={getUserPlaceholderImage(item.email || item.id)}
                        alt={item.name}
                        width={32}
                        height={32}
                      />
                      <div className="flex flex-col justify-center gap-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-secondary leading-none font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/15 text-accent">
                            Level {item.level}
                          </span>
                        </div>
                        <p className="text-secondary/50 text-[0.7rem] truncate font-mono">
                          {item.email} {item.country ? `• ${item.country}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.status === "ACTIVE"
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-secondary/10 text-secondary/60 border-secondary/20"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="hidden sm:inline text-sm text-secondary/50 font-mono">
                        {item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: TIER BREAKDOWN ───────────────────────────────────── */}
        {activeTab === "tiers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TIERS_SUMMARY.map((t) => {
              const tierMembers = members.filter((m) => m.level === t.level);
              return (
                <div
                  key={t.level}
                  className="p-3.5 rounded-xl border border-secondary/10 bg-background flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-lg bg-accent/15 text-accent font-bold font-mono flex items-center justify-center text-sm">
                      L{t.level}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-secondary">
                        Level {t.level} Tier
                      </span>
                      <span className="text-[11px] text-secondary/50 font-mono">
                        {t.rate} profit • {t.lots}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-semibold px-2 py-0.5 rounded bg-secondary/5 border border-secondary/10 text-secondary">
                    {tierMembers.length} members
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default function NetworkPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center">
          <div className="skeleton size-8 rounded-full" />
        </div>
      }
    >
      <NetworkContent />
    </Suspense>
  );
}
