"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/src/lib/stores/appStore";
import TotalBalanceCard from "@/src/components/sections/TotalBalanceCard";
import NetworkCard from "@/src/components/sections/NetworkCard";
import PayrollHealthCard from "@/src/components/sections/PayrollHealth";
import PartnerReferralCard from "@/src/components/sections/PartnerReferralCard";
import OrgVerificationCard from "@/src/components/sections/OrgVerificationCard";
import MonthlyBudgetCard from "@/src/components/sections/MonthlyBudgetCard";
import PlatformIntegrationCards from "@/src/components/sections/PlatformIntegrationCards";

export default function DashboardPage() {
  const router = useRouter();
  const isConnectedToRoboForex = useAppStore(
    (s) => s.isConnectedToRoboForex,
  );

  useEffect(() => {
    if (!isConnectedToRoboForex) {
      router.replace("/dashboard/profile");
    }
  }, [isConnectedToRoboForex, router]);

  if (!isConnectedToRoboForex) {
    return null;
  }

  const defaultInitialData = {
    currency: {
      name: "USDT",
      logoUrl: "/images/stablecoins/usdt.png",
      fiatSign: "$",
    },
  };

  return (
    <section className="w-full h-full overflow-y-auto pt-5 px-5 pb-16 flex flex-col gap-4">
      {/* Main Dashboard Grid */}
      <div className="grid w-full max-w-320 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 cxl:grid-cols-3 gap-4 mt-0">
        {/* Top Row (Three Top Cards) */}
        <TotalBalanceCard initialData={defaultInitialData} />
        <NetworkCard />
        <PayrollHealthCard />

        {/* Partner Referral Card under the top cards */}

        {/* Activity Card */}
        <div className="col-span-1 md:col-span-2">
          <PartnerReferralCard />
        </div>

        <div className="flex flex-col gap-4">
          <OrgVerificationCard />
          <MonthlyBudgetCard />
        </div>
      </div>

      {/* Platform Integration & Partner Cards */}
      <PlatformIntegrationCards />
    </section>
  );
}
