"use client";

import React from "react";
import PersonalInformationCard from "@/src/components/sections/profile/PersonalInformationCard";
import PartnerReferralCard from "@/src/components/sections/PartnerReferralCard";
import PlatformIntegrationCards from "@/src/components/sections/PlatformIntegrationCards";

export default function ProfilePage() {
  return (
    <section className="w-full h-full overflow-y-auto pt-5 px-3 pb-16 flex flex-col gap-6 sm:px-5">
      {/* ─── Profile Content Stack ───────────────────────────────────────────── */}
      <div className="w-full max-w-320 flex flex-col gap-6">
        {/* 1. Modern Personal Information Card */}
        <PersonalInformationCard />

        {/* 2. Partner Referral QR Card */}
        <div className="w-full">
          <PartnerReferralCard />
        </div>

        {/* 3. Platform Integration Cards */}
        <PlatformIntegrationCards />
      </div>
    </section>
  );
}
