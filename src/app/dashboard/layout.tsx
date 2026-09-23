"use client";

import React, { useEffect, useState } from "react";
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
  const [isMobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const { data: userData } = useUser();

  useEffect(() => {
    if (!isMobileNavigationOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavigationOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobileNavigationOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileNavigationOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const wallet = userData?.data?.wallet;
  const rawBalance = wallet?.available_balance || wallet?.balance || "0.00";
  const availableBalance = parseFloat(rawBalance) || 0;

  return (
    <div className="w-full flex flex-col h-dvh bg-shell-background overflow-hidden">
      <Header
        isMobileNavigationOpen={isMobileNavigationOpen}
        onToggleMobileNavigation={() => setMobileNavigationOpen((open) => !open)}
      />
      <div className="flex-1 flex overflow-hidden">
        {isMobileNavigationOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavigationOpen(false)}
            className="fixed inset-x-0 bottom-0 top-19 z-40 bg-shell-background/60 lg:hidden"
          />
        )}
        <Drawer
          mobileOpen={isMobileNavigationOpen}
          onCloseMobile={() => setMobileNavigationOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-xl bg-background">
          <div className="flex min-h-18 shrink-0 items-center justify-between gap-4 bg-primary/50 px-3 sm:px-5 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-3 overflow-hidden">
              <span className="hidden text-sm font-medium text-secondary sm:inline">Trackmarkets</span>
              <svg aria-hidden="true" className="hidden size-3 shrink-0 text-subtext sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
