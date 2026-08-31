"use client";

import React from "react";
import Header from "@/src/components/layout/Header";
import Drawer from "@/src/components/layout/Drawer";
import CommissionWithdrawalDrawer from "@/src/components/sections/CommissionWithdrawalDrawer";
import { useAppStore } from "@/src/lib/stores/appStore";
import { useUser } from "@/src/lib/hooks/useUser";

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
    <div className="w-full flex flex-col h-screen bg-background overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Drawer />
        <div className="flex-1 overflow-y-auto w-full h-full">
          {children}
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
