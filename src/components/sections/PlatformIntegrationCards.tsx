"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";
import { useAppStore } from "@/src/lib/stores/appStore";

export const PlatformIntegrationCards: React.FC = () => {
  const { data: serverUserData } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const user = serverUserData?.data?.user || storeUser;
  const userIdDisplay = user?.referral_code || "";

  const isConnectedToStockTrader = useAppStore(
    (s) => s.isConnectedToStockTrader,
  );

  return (
    <div className="w-full max-w-320 flex flex-col gap-4 mt-2">
      {/* ─── Card 1: StockTrader Registration (First Card) ────────────────────── */}
      <div className="w-full rounded-xl bg-tetiary border border-secondary/15 p-5 sm:p-6 flex flex-col justify-between gap-5 relative shadow-sm text-white">
        {/* Top Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto sm:absolute sm:top-5 sm:right-6">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isConnectedToStockTrader
                ? "bg-success/25 text-success border-success/40"
                : "bg-white/10 text-white/70 border-white/20"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isConnectedToStockTrader ? "bg-success" : "bg-white/40"
              }`}
            />
            {isConnectedToStockTrader ? "User Active" : "Not Connected"}
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 border border-white/20 text-white/90">
            ID: {userIdDisplay}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Info & CTA */}
          <div className="flex flex-col gap-2.5 max-w-2xl">
            <h3 className="text-lg font-medium font-clash-display text-white tracking-tight">
              StockTrader Registration
            </h3>

            <p className="text-xs text-white/80 leading-relaxed max-w-xl">
              To access all platform features, please register your Crack
              Markets account exclusively using this button. Registering through
              Crack Markets ensures proper linking and synchronization between
              both accounts.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-primary hover:bg-accent/90 text-xs font-semibold transition-all shadow-sm active:scale-98 cursor-pointer"
              >
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
                <span>
                  {isConnectedToStockTrader
                    ? "Login to StockTrader"
                    : "Connect to StockTrader"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Brand Mark */}
          <div className="flex items-center justify-start md:justify-end shrink-0 pr-4">
            <span className="font-clash-display font-semibold text-3xl sm:text-4xl text-white/90 tracking-tight select-none">
              STOCK-TRADER
            </span>
          </div>
        </div>

        {/* Warning Note */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-[11px] text-accent font-medium tracking-wide">
            ● DO NOT REGISTER DIRECTLY ON THE STOCKTRADER PLATFORM, AS THE
            ACCOUNT WILL NOT BE SYNCHRONIZED. ●
          </p>
        </div>
      </div>

      {/* ─── Card 2: FOXAi ────────────────────────────────────────────────────── */}
      <div className="w-full rounded-xl bg-tetiary border border-secondary/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative shadow-sm text-white">
        {/* Left Side */}
        <div className="flex flex-col gap-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-accent/25 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3.5 text-accent"
              >
                <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a8.04 8.04 0 0 1-6.192 6.192l-1.192.24a1 1 0 0 0 0 1.96l1.192.24a8.04 8.04 0 0 1 6.192 6.192l.24 1.192a1 1 0 0 0 1.96 0l.24-1.192a8.04 8.04 0 0 1 6.192-6.192l1.192-.24a1 1 0 0 0 0-1.96l-1.192-.24a8.04 8.04 0 0 1-6.192-6.192l-.24-1.192ZM4.5 2a.75.75 0 0 0-.75.75v1.5H2.25a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5v-1.5A.75.75 0 0 0 4.5 2Z" />
              </svg>
            </div>
            <h3 className="text-base font-medium font-clash-display text-white tracking-tight">
              FOXAi
            </h3>
          </div>

          <p className="text-xs text-white/80 leading-relaxed">
            Automate your strategies with algorithmic AI trading and analytics.
          </p>

          <div className="pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-primary hover:bg-accent/90 text-xs font-semibold transition-all shadow-sm active:scale-98"
            >
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Right Side Brand & Link */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-clash-display font-medium text-accent text-xs">
              AI
            </div>
            <span className="font-clash-display font-semibold text-2xl text-white tracking-tight">
              FOXAi
            </span>
          </div>

          <Link
            href="/dashboard/trading"
            className="text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <span>More Information</span>
          </Link>
        </div>
      </div>

      {/* ─── Card 3: BIX Wallets & Debit Card ───────────────────────────────────── */}
      <div className="hidden w-full rounded-xl bg-tetiary border border-secondary/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative shadow-sm text-white">
        {/* Left Side */}
        <div className="flex flex-col gap-2.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4 text-accent"
            >
              <path
                fillRule="evenodd"
                d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.376 0C5.26 16.563 2 12.162 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75ZM10 4.316a13.447 13.447 0 0 1-5.992 2.458C4.004 8.784 4 10.87 4 12c0 3.79 2.378 7.172 6 8.57 3.622-1.398 6-4.78 6-8.57 0-1.13-.004-3.216-.008-5.226A13.447 13.447 0 0 1 10 4.316Z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-base font-medium font-clash-display text-white tracking-tight">
              BIX Wallets & Debit Card
            </h3>
            <span className="text-xs text-white/60">(Coming Soon)</span>
          </div>

          <p className="text-xs text-white/80 leading-relaxed">
            Add an extra layer of security to your account.
          </p>

          <div className="pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-primary hover:bg-accent/90 text-xs font-semibold transition-all shadow-sm active:scale-98"
            >
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Right Side Brand & Link */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
              ✦
            </div>
            <span className="font-clash-display font-semibold text-2xl text-white tracking-tight">
              BIX
            </span>
          </div>

          <Link
            href="/dashboard/profile"
            className="text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <span>More Information</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlatformIntegrationCards;
