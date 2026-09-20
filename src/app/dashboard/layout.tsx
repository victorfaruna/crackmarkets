"use client";

import React from "react";
import Header from "@/src/components/layout/Header";
import Drawer from "@/src/components/layout/Drawer";
import CommissionWithdrawalDrawer from "@/src/components/sections/CommissionWithdrawalDrawer";
import { useAppStore } from "@/src/lib/stores/appStore";
import { useUser } from "@/src/lib/hooks/useUser";
import Breadcrum from "@/src/components/shared/Breadcrum";
import DashboardSearch from "@/src/components/layout/DashboardSearch";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isWalletDrawerOpen = useAppStore((s) => s.isWalletDrawerOpen);
  const setWalletDrawerOpen = useAppStore((s) => s.setWalletDrawerOpen);
  const { data: userData } = useUser();

  const wallet = userData?.data?.wallet;
  const rawBalance = wallet?.available_balance || wallet?.balance || "0.00";
  const availableBalance = parseFloat(rawBalance) || 0;

  return (
    <div className="w-full flex flex-col h-dvh bg-shell-background overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Drawer />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-xl bg-background">
          <div className="flex min-h-18 shrink-0 items-center justify-between gap-4 bg-primary/50 px-5 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-3 overflow-hidden">
              <span className="text-sm font-medium text-secondary">Trackmarkets</span>
              <svg aria-hidden="true" className="size-3 shrink-0 text-subtext" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
              </svg>
              <Breadcrum />
            </nav>
            <div className="hidden shrink-0 lg:block"><DashboardSearch compact /></div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-primary/50 [&>section]:pt-0">
            {children}
          </div>
        </div>
      </div>

      {/* Global Wallet / Withdrawal Drawer */}
      <CommissionWithdrawalDrawer
        isOpen={isWalletDrawerOpen}
        onClose={() => setWalletDrawerOpen(false)}
        availableBalance={availableBalance}
      />
    </div>
  );
}
