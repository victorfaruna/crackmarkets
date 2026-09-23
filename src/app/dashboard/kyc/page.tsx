"use client";

import React, { useState } from "react";
import { useLinkRoboForex, useUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";

export default function KycBrokerPage() {
  const { data: serverUserData } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const user = serverUserData?.data?.user || storeUser;

  const kycStatus = user?.kyc_status || "NOT_SUBMITTED";
  const fundingStatus = user?.funding_status || "LOCKED";
  const userCountry = user?.country || "United States";
  const brokerLinked = user?.roboforex_linked === true;
  const kycPending = kycStatus === "PENDING";

  // Modal States
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);

  // KYC Submission State
  const [docType, setDocType] = useState<"PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE">("PASSPORT");
  const [docNumber, setDocNumber] = useState("");
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [kycError, setKycError] = useState("");

  // Broker Link State
  const [brokerAccountId, setBrokerAccountId] = useState("");
  const [brokerMessage, setBrokerMessage] = useState("");
  const { mutateAsync: linkRoboForex, isPending: isLinkingBroker } = useLinkRoboForex();

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycError(
      "KYC document submission is unavailable until a verified KYC provider is configured.",
    );
  };

  const handleBrokerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerAccountId) return;
    setBrokerMessage("");
    try {
      const response = await linkRoboForex(brokerAccountId.trim());
      setBrokerMessage(response.message || "RoboForex account verified and linked.");
    } catch {
      setBrokerMessage("The broker account could not be verified.");
    }
  };

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-3 pb-16 flex flex-col gap-6 sm:px-5">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-secondary text-lg font-medium font-inter">
          KYC & Broker Verification
        </h1>
        <p className="text-secondary/60 text-sm">
          Identity verification and broker account connection status.
        </p>
      </div>

      {/* ─── Minimal Status Card ─────────────────────────────────────────────── */}
      <div className="w-full rounded-xl border-[0.5px] border-secondary/10 bg-primary/20 p-5 sm:p-6 flex flex-col gap-5">
        {/* Row 1: KYC Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-secondary/3 border-[0.5px] border-secondary/8 flex items-center justify-center text-secondary/60 shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                />
              </svg>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-secondary">
                  Identity Verification (KYC)
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border-[0.5px] ${
                    kycStatus === "APPROVED"
                      ? "bg-success/10 text-success border-success/20"
                      : kycStatus === "PENDING"
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-secondary/5 text-secondary/60 border-secondary/10"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      kycStatus === "APPROVED"
                        ? "bg-success"
                        : kycStatus === "PENDING"
                        ? "bg-accent animate-pulse"
                        : "bg-secondary/40"
                    }`}
                  />
                  {kycStatus === "NOT_SUBMITTED"
                    ? "Required"
                    : kycStatus}
                </span>
              </div>
              <p className="text-[11px] text-secondary/50">
                Verify your government-issued document to unlock withdrawals and live trading.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsKycModalOpen(true)}
            disabled={kycPending || kycStatus === "APPROVED"}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-secondary/4 hover:bg-secondary/8 border-[0.5px] border-secondary/10 text-secondary text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {kycPending
              ? "Pending Review"
              : kycStatus === "APPROVED"
              ? "Verified"
              : "Verify Identity"}
          </button>
        </div>

        <div className="border-b-[0.5px] border-secondary/8" />

        {/* Row 2: Broker Account Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-secondary/3 border-[0.5px] border-secondary/8 flex items-center justify-center text-secondary/60 shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-secondary">
                  RoboForex Broker Account
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border-[0.5px] ${
                    brokerLinked
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-secondary/5 text-secondary/60 border-secondary/10"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      brokerLinked ? "bg-success" : "bg-secondary/40"
                    }`}
                  />
                  {brokerLinked ? "Connected" : "Not Linked"}
                </span>
              </div>
              <p className="text-[11px] text-secondary/50">
                Verify your RoboForex account ID before broker synchronization can be enabled.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBrokerModalOpen(true)}
            disabled={brokerLinked}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-secondary/4 hover:bg-secondary/8 border-[0.5px] border-secondary/10 text-secondary text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {brokerLinked ? "Connected" : "Link Broker"}
          </button>
        </div>

        <div className="border-b-[0.5px] border-secondary/8" />

        {/* Row 3: Account Metadata & Funding Gate */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-secondary/50 pt-0.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Country: <span className="font-medium text-secondary/80">{userCountry}</span>
            </span>
            <span>•</span>
            <span>
              Funding Gate:{" "}
              <span
                className={`font-semibold ${
                  fundingStatus === "UNLOCKED" ? "text-success" : "text-secondary/70"
                }`}
              >
                {fundingStatus}
              </span>
            </span>
          </div>

          <span className="text-[10px] text-secondary/40">
            Source of truth: Broker API webhooks
          </span>
        </div>
      </div>

      {/* ─── Modal 1: KYC Verification Trigger Modal ─────────────────────────── */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-background border-[0.5px] border-secondary/15 rounded-xl p-5 shadow-xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-3 border-b-[0.5px] border-secondary/8">
              <h3 className="font-medium text-sm font-inter text-secondary">
                Submit KYC Document
              </h3>
              <button
                type="button"
                onClick={() => setIsKycModalOpen(false)}
                className="size-6 rounded-md flex items-center justify-center text-secondary/50 hover:text-secondary hover:bg-secondary/5 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleKycSubmit} className="flex flex-col gap-3.5 text-sm text-secondary">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-secondary/70 text-[11px]">
                  Document Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "PASSPORT" as const, label: "Passport" },
                    { id: "NATIONAL_ID" as const, label: "National ID" },
                    { id: "DRIVERS_LICENSE" as const, label: "Driver's License" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDocType(t.id)}
                      className={`py-1.5 px-2 rounded-lg text-sm font-medium border-[0.5px] transition-colors cursor-pointer ${
                        docType === t.id
                          ? "bg-secondary text-background border-secondary font-semibold"
                          : "bg-secondary/3 border-secondary/8 text-secondary/70 hover:text-secondary"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-secondary/70 text-[11px]">
                  Document Number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. A12345678"
                  required
                  className="w-full h-9 px-3 rounded-lg border-[0.5px] border-secondary/10 bg-secondary/3 text-secondary text-sm placeholder:text-secondary/30 outline-hidden focus:border-secondary/25"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-secondary/70 text-[11px]">
                  Document Photo
                </label>
                <label className="h-12 rounded-lg border-[0.5px] border-secondary/10 bg-secondary/3 hover:bg-secondary/6 flex items-center justify-between px-3 cursor-pointer transition-colors text-sm">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFrontFile(e.target.files[0].name);
                    }}
                  />
                  <span className="text-secondary/70 truncate max-w-[200px] text-sm">
                    {frontFile || "Choose photo file"}
                  </span>
                  <span className="text-[11px] text-accent font-medium shrink-0">
                    Upload
                  </span>
                </label>
              </div>

              {kycError && (
                <div className="p-2.5 rounded-lg bg-error/10 border-[0.5px] border-error/20 text-error text-sm font-medium text-center">
                  {kycError}
                </div>
              )}

              <button
                type="submit"
                disabled
                className="w-full h-9 rounded-full bg-secondary text-background font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 mt-1"
              >
                Submission Unavailable
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Broker Connection Modal ───────────────────────────────── */}
      {isBrokerModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-background border-[0.5px] border-secondary/15 rounded-xl p-5 shadow-xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-3 border-b-[0.5px] border-secondary/8">
              <h3 className="font-medium text-sm font-inter text-secondary">
                Link RoboForex Account
              </h3>
              <button
                type="button"
                onClick={() => setIsBrokerModalOpen(false)}
                className="size-6 rounded-md flex items-center justify-center text-secondary/50 hover:text-secondary hover:bg-secondary/5 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBrokerSubmit} className="flex flex-col gap-3.5 text-sm text-secondary">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-secondary/70 text-[11px]">
                  Account Login ID
                </label>
                <input
                  type="text"
                  value={brokerAccountId}
                  onChange={(e) => setBrokerAccountId(e.target.value)}
                  placeholder="e.g. 68294012"
                  required
                  className="w-full h-9 px-3 rounded-lg border-[0.5px] border-secondary/10 bg-secondary/3 text-secondary text-sm font-mono placeholder:font-sans placeholder:text-secondary/30 outline-hidden focus:border-secondary/25"
                />
              </div>

              {brokerMessage && (
                <div className="p-2.5 rounded-lg bg-primary border-[0.5px] border-secondary/20 text-secondary text-sm font-medium text-center">
                  {brokerMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLinkingBroker}
                className="w-full h-9 rounded-full bg-secondary text-background font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 mt-1"
              >
                {isLinkingBroker ? "Connecting..." : "Connect Broker"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
