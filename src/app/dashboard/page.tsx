"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/lib/hooks/useUser";
import TotalBalanceCard from "@/src/components/sections/TotalBalanceCard";
import NetworkCard from "@/src/components/sections/NetworkCard";
import PayrollHealthCard from "@/src/components/sections/PayrollHealth";
import PartnerReferralCard from "@/src/components/sections/PartnerReferralCard";
import OrgVerificationCard from "@/src/components/sections/OrgVerificationCard";
import PlatformIntegrationCards from "@/src/components/sections/PlatformIntegrationCards";

export default function DashboardPage() {
  const router = useRouter();
  const { data: userData, isLoading } = useUser();
  const isConnectedToRoboForex =
    userData?.data?.user.roboforex_linked === true;

  useEffect(() => {
    if (!isLoading && userData && !isConnectedToRoboForex) {
      router.replace("/dashboard/profile");
    }
  }, [isConnectedToRoboForex, isLoading, router, userData]);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-accent" />
      </div>
    );
  }

  if (!isConnectedToRoboForex) {
    return null;
  }

  const defaultInitialData = {
    currency: {
      name: "USDT",
      logoUrl: "/images/stablecoins/usdt.svg",
      fiatSign: "$",
    },
  };

  return (
    <section className="w-full h-full overflow-y-auto pt-5 px-3 pb-16 flex flex-col gap-4 sm:px-5">
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
        </div>
      </div>

      {/* Platform Integration & Partner Cards */}
      <PlatformIntegrationCards />
    </section>
  );
}
