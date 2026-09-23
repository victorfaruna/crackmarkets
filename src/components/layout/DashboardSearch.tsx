"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/src/lib/stores/appStore";

interface SearchItem {
  label: string;
  description: string;
  href: string;
  keywords: string;
}

const ALWAYS_AVAILABLE: SearchItem[] = [
  { label: "Profile", description: "Personal details and integrations", href: "/dashboard/profile", keywords: "account personal foxalgo roboforex" },
  { label: "Wallet", description: "Balances, transactions, and withdrawals", href: "/dashboard/wallet", keywords: "money balance payout withdraw transactions" },
  { label: "Events & Competitions", description: "Upcoming events and calendar", href: "/dashboard/events", keywords: "calendar webinar contest summit leadership" },
  { label: "My Network", description: "Referral network and affiliates", href: "/dashboard/network", keywords: "referral affiliate downline global top" },
  { label: "Notifications", description: "Commission and account notifications", href: "/dashboard/notifications", keywords: "alerts messages notices" },
  { label: "Settings", description: "Password and account security", href: "/dashboard/settings", keywords: "security password preferences" },
  { label: "KYC & Broker Account", description: "Identity and broker account status", href: "/dashboard/kyc", keywords: "verification identity roboforex broker" },
];

const CONNECTED_ONLY: SearchItem[] = [
  { label: "Overview", description: "Dashboard summary", href: "/dashboard", keywords: "home dashboard balances" },
  { label: "Commissions", description: "Income streams and distributions", href: "/dashboard/commissions", keywords: "earnings bonus profit share lot commission" },
  { label: "Rewards & Incentives", description: "Leadership pools and milestones", href: "/dashboard/rewards", keywords: "travel car estate ladder strong leg" },
  { label: "Trading Analytics", description: "Trading performance and positions", href: "/dashboard/analytics", keywords: "trading markets positions equity performance" },
];

export default function DashboardSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const isConnectedToRoboForex = useAppStore((state) => state.isConnectedToRoboForex);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const items = useMemo(
    () => (isConnectedToRoboForex ? [...CONNECTED_ONLY, ...ALWAYS_AVAILABLE] : ALWAYS_AVAILABLE),
    [isConnectedToRoboForex],
  );
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(term));
  }, [items, query]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (compact) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [compact]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const selectItem = (item: SearchItem) => {
    close();
    router.push(item.href);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Search dashboard"
        onClick={() => setIsOpen(true)}
        className={`flex h-10 items-center gap-3 rounded-xl border px-3.5 text-sm transition-colors ${
          compact
            ? "w-58 border-secondary/10 bg-background text-secondary/50 hover:border-secondary/20"
            : "w-full border-on-dark/10 bg-on-dark/5 text-on-dark/60 shadow-inner shadow-on-dark/5 hover:bg-on-dark/10"
        }`}
      >
        <svg aria-hidden="true" className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10.75" cy="10.75" r="6.75" />
          <path strokeLinecap="round" d="m16 16 4.5 4.5" />
        </svg>
        <span className="min-w-0 flex-1 truncate text-left">{compact ? "Search" : "Search your dashboard..."}</span>
        <kbd className={`kbd kbd-sm shrink-0 rounded border-0 font-inter ${compact ? "bg-primary text-secondary/50" : "bg-on-dark/10 text-on-dark/70"}`}>⌘ K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-secondary/40 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={close}>
          <div className="w-full max-w-150 overflow-hidden rounded-xl border border-secondary/15 bg-background shadow-xl" role="dialog" aria-modal="true" aria-label="Search dashboard" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-secondary/10 px-4">
              <svg aria-hidden="true" className="size-5 shrink-0 text-secondary/55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10.75" cy="10.75" r="6.75" />
                <path strokeLinecap="round" d="m16 16 4.5 4.5" />
              </svg>
              <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages and actions..." className="h-14 min-w-0 flex-1 bg-transparent text-sm text-secondary outline-none placeholder:text-secondary/45" aria-label="Search pages and actions" />
              <kbd className="rounded border border-secondary/10 px-1.5 py-0.5 text-xs text-secondary/55">Esc</kbd>
            </div>

            <div className="max-h-105 overflow-y-auto p-2">
              {results.length ? results.map((item) => (
                <button key={item.href} type="button" onClick={() => selectItem(item)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-primary">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5 16 12 9 19" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-secondary">{item.label}</span>
                    <span className="block truncate text-xs text-secondary/60">{item.description}</span>
                  </span>
                </button>
              )) : (
                <p className="px-3 py-10 text-center text-sm text-secondary/60">No dashboard pages match “{query}”.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
