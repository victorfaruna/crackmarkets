"use client";

import React, { useState } from "react";
import { useUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";

type KycDocumentType = "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE";

export default function KycBrokerPage() {
  const { data: serverUserData } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const user = serverUserData?.data?.user || storeUser;

  const kycStatus = user?.kyc_status || "NOT_SUBMITTED";
  const fundingStatus = user?.funding_status || "LOCKED";
  const userCountry = user?.country || "United States";

  // KYC Form State
  const [docType, setDocType] = useState<KycDocumentType>("PASSPORT");
  const [docNumber, setDocNumber] = useState("");
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<string | null>(null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  // Broker Link State
  const [brokerServer, setBrokerServer] = useState("RoboForex-ECN-Pro");
  const [brokerAccountId, setBrokerAccountId] = useState("");
  const [brokerPassword, setBrokerPassword] = useState("");
  const [isLinkingBroker, setIsLinkingBroker] = useState(false);
  const [brokerLinked, setBrokerLinked] = useState(false);

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber) return;

    setIsSubmittingKyc(true);
    setTimeout(() => {
      setIsSubmittingKyc(false);
      setKycSubmitted(true);
    }, 1200);
  };

  const handleBrokerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerAccountId || !brokerPassword) return;

    setIsLinkingBroker(true);
    setTimeout(() => {
      setIsLinkingBroker(false);
      setBrokerLinked(true);
    }, 1200);
  };

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-6">
      {/* ─── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-secondary text-lg font-medium font-clash-display">
          KYC & Broker Account Link
        </h1>
        <p className="text-secondary/60 text-xs">
          Verify your identity and connect your RoboForex broker account to
          activate funding and live trading.
        </p>
      </div>

      {/* ─── Verification Progress Stepper ───────────────────────────────────── */}
      <div className="w-full rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-secondary/10">
          <div>
            <span className="text-xs text-secondary/60 font-medium">
              Account Verification Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  kycSubmitted || kycStatus === "APPROVED"
                    ? "bg-success/20 text-success border-success/30"
                    : kycStatus === "PENDING"
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-secondary/10 text-secondary/70 border-secondary/20"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    kycSubmitted || kycStatus === "APPROVED"
                      ? "bg-success"
                      : kycStatus === "PENDING"
                      ? "bg-accent animate-pulse"
                      : "bg-secondary/40"
                  }`}
                />
                {kycSubmitted
                  ? "PENDING REVIEW"
                  : kycStatus === "NOT_SUBMITTED"
                  ? "VERIFICATION REQUIRED"
                  : kycStatus}
              </span>

              <span className="text-xs text-secondary/40">•</span>

              <span className="text-xs font-medium text-secondary/70">
                Funding:{" "}
                <span
                  className={`font-semibold ${
                    fundingStatus === "UNLOCKED"
                      ? "text-success"
                      : "text-secondary/60"
                  }`}
                >
                  {fundingStatus}
                </span>
              </span>
            </div>
          </div>

          <div className="text-xs text-secondary/60">
            Country of Residence:{" "}
            <span className="font-semibold text-secondary">{userCountry}</span>
          </div>
        </div>

        {/* 4-Step Linear Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/4 border border-secondary/10">
            <div className="size-6 rounded-full bg-success/20 text-success flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-secondary truncate">
                1. Email Verified
              </span>
              <span className="text-[10px] text-secondary/50 truncate">
                Referral code active
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/4 border border-secondary/10">
            <div
              className={`size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                kycSubmitted || kycStatus !== "NOT_SUBMITTED"
                  ? "bg-success/20 text-success"
                  : "bg-secondary/10 text-secondary/50"
              }`}
            >
              {kycSubmitted || kycStatus !== "NOT_SUBMITTED" ? "✓" : "2"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-secondary truncate">
                2. Submit KYC
              </span>
              <span className="text-[10px] text-secondary/50 truncate">
                ID & Address verification
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/4 border border-secondary/10">
            <div
              className={`size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                kycStatus === "APPROVED"
                  ? "bg-success/20 text-success"
                  : "bg-secondary/10 text-secondary/50"
              }`}
            >
              {kycStatus === "APPROVED" ? "✓" : "3"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-secondary truncate">
                3. Compliance Review
              </span>
              <span className="text-[10px] text-secondary/50 truncate">
                Automated AML screening
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/4 border border-secondary/10">
            <div
              className={`size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                brokerLinked
                  ? "bg-success/20 text-success"
                  : "bg-secondary/10 text-secondary/50"
              }`}
            >
              {brokerLinked ? "✓" : "4"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-secondary truncate">
                4. Broker Link
              </span>
              <span className="text-[10px] text-secondary/50 truncate">
                Trading capital unlocked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Grid: KYC Form + Broker Link ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Card 1: Identity & Document Verification ─────────────────────── */}
        <div className="rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-secondary/10">
            <div>
              <h2 className="text-base font-semibold font-clash-display text-secondary tracking-tight">
                Identity Document Submission
              </h2>
              <p className="text-xs text-secondary/60">
                Upload a government-issued identity document.
              </p>
            </div>
            <span className="size-8 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                />
              </svg>
            </span>
          </div>

          <form onSubmit={handleKycSubmit} className="flex flex-col gap-4 text-xs text-secondary">
            {/* Document Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-secondary/80">
                Document Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "PASSPORT" as const, label: "Passport" },
                  { id: "NATIONAL_ID" as const, label: "National ID" },
                  { id: "DRIVERS_LICENSE" as const, label: "Driver's License" },
                ].map((type) => {
                  const active = docType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDocType(type.id)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer text-center truncate ${
                        active
                          ? "bg-secondary text-background border-secondary font-semibold shadow-2xs"
                          : "bg-primary/40 border-subtext/30 text-secondary/70 hover:text-secondary"
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Number */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-secondary/80">
                Document Number / Passport ID
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. A12345678"
                required
                className="w-full h-10 px-3.5 rounded-xl border border-subtext/30 bg-primary/40 text-secondary text-xs placeholder:text-secondary/30 outline-hidden focus:border-subtext/70"
              />
            </div>

            {/* Upload Boxes: Front & Back */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front File */}
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-secondary/80">
                  Front Side Photo
                </label>
                <label className="h-24 rounded-xl border border-dashed border-subtext/40 bg-primary/20 hover:bg-primary/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors p-2 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        setFrontFile(e.target.files[0].name);
                    }}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 text-secondary/40"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-[11px] text-secondary/70 truncate max-w-full px-2">
                    {frontFile || "Upload front photo"}
                  </span>
                </label>
              </div>

              {/* Back File */}
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-secondary/80">
                  Back Side Photo
                </label>
                <label className="h-24 rounded-xl border border-dashed border-subtext/40 bg-primary/20 hover:bg-primary/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors p-2 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        setBackFile(e.target.files[0].name);
                    }}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 text-secondary/40"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-[11px] text-secondary/70 truncate max-w-full px-2">
                    {backFile || "Upload back photo"}
                  </span>
                </label>
              </div>
            </div>

            {kycSubmitted && (
              <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold text-center flex items-center justify-center gap-2">
                <span className="size-1.5 rounded-full bg-success animate-ping" />
                Documents submitted for compliance verification.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingKyc || kycSubmitted}
              className="w-full h-11 rounded-full bg-secondary text-background font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isSubmittingKyc
                ? "Submitting Verification..."
                : kycSubmitted
                ? "Verification Pending Review"
                : "Submit KYC Documents"}
            </button>
          </form>
        </div>

        {/* ─── Card 2: RoboForex Broker Account Link ────────────────────────── */}
        <div className="rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-secondary/10">
            <div>
              <h2 className="text-base font-semibold font-clash-display text-secondary tracking-tight">
                RoboForex Broker Connection
              </h2>
              <p className="text-xs text-secondary/60">
                Link your MetaTrader trading credentials for lot bonus sync.
              </p>
            </div>
            <span className="size-8 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </span>
          </div>

          <form onSubmit={handleBrokerSubmit} className="flex flex-col gap-4 text-xs text-secondary">
            {/* Broker Server */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-secondary/80">
                Trading Server
              </label>
              <select
                value={brokerServer}
                onChange={(e) => setBrokerServer(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-subtext/30 bg-primary/40 text-secondary text-xs outline-hidden focus:border-subtext/70 cursor-pointer"
              >
                <option value="RoboForex-ECN-Pro">RoboForex-ECN-Pro (Recommended)</option>
                <option value="RoboForex-ProStandard">RoboForex-ProStandard</option>
                <option value="RoboForex-ECN-Prime">RoboForex-ECN-Prime</option>
              </select>
            </div>

            {/* Broker Account ID */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-secondary/80">
                MetaTrader Account Login ID
              </label>
              <input
                type="text"
                value={brokerAccountId}
                onChange={(e) => setBrokerAccountId(e.target.value)}
                placeholder="e.g. 68294012"
                required
                className="w-full h-10 px-3.5 rounded-xl border border-subtext/30 bg-primary/40 text-secondary text-xs font-mono placeholder:font-sans placeholder:text-secondary/30 outline-hidden focus:border-subtext/70"
              />
            </div>

            {/* Broker Read-Only Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-medium text-secondary/80">
                  Investor / Read-Only Password
                </label>
                <span className="text-[10px] text-secondary/50">
                  Read-only access for sync
                </span>
              </div>
              <input
                type="password"
                value={brokerPassword}
                onChange={(e) => setBrokerPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full h-10 px-3.5 rounded-xl border border-subtext/30 bg-primary/40 text-secondary text-xs placeholder:text-secondary/30 outline-hidden focus:border-subtext/70"
              />
            </div>

            {/* Live Stats Preview when Linked */}
            <div className="p-3 rounded-xl border border-subtext/20 bg-primary/20 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-secondary/60">
                <span>Broker Connection</span>
                <span className="font-medium text-secondary">
                  {brokerLinked ? "Connected (ECN-Pro)" : "Not Linked"}
                </span>
              </div>
              <div className="flex items-center justify-between text-secondary/60">
                <span>Lot Volume Sync</span>
                <span className="font-medium text-secondary">
                  {brokerLinked ? "Realtime via Webhooks" : "Pending Connection"}
                </span>
              </div>
            </div>

            {brokerLinked && (
              <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold text-center flex items-center justify-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                RoboForex account linked & synchronized.
              </div>
            )}

            <button
              type="submit"
              disabled={isLinkingBroker || brokerLinked}
              className="w-full h-11 rounded-full bg-secondary text-background font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isLinkingBroker
                ? "Connecting to Broker API..."
                : brokerLinked
                ? "Broker Account Active"
                : "Link Broker Account"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
