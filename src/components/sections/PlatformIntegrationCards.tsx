"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser, useLinkRoboForex } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";
import { useAppStore } from "@/src/lib/stores/appStore";

const ROBOFOREX_MASTER_URL = "https://my.roboforex.com/en/?a=lazwx";
const FOXALGO_URL =
  "https://my.roboforex.com/en/copy-trading/traders/bbbb/77030815?period=3";

export const PlatformIntegrationCards: React.FC = () => {
  const { data: serverUserData } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const user = serverUserData?.data?.user || storeUser;

  const isConnectedToRoboForex = useAppStore((s) => s.isConnectedToRoboForex);

  const { mutateAsync: linkRoboForex, isPending: isLinking } =
    useLinkRoboForex();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [brokerIdInput, setBrokerIdInput] = useState("");
  const [linkError, setLinkError] = useState("");

  // Real broker ID from server
  const brokerIdDisplay =
    serverUserData?.data?.user?.roboforex_id || user?.roboforex_id || "";

  const handleConnectClick = () => {
    // Open the Trackmarkets RoboForex master profile in a new tab.
    window.open(ROBOFOREX_MASTER_URL, "_blank", "noopener,noreferrer");
    // Show the confirmation step
    setAwaitingConfirmation(true);
    setLinkError("");
  };

  const handleConfirmLinked = async () => {
    const trimmed = brokerIdInput.trim();
    if (!trimmed) {
      setLinkError("Please enter your RoboForex account ID.");
      return;
    }
    try {
      setLinkError("");
      await linkRoboForex(trimmed);
      setAwaitingConfirmation(false);
    } catch {
      setLinkError("Failed to link account. Please try again.");
    }
  };

  const handleLoginClick = () => {
    window.open(ROBOFOREX_MASTER_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-320 flex flex-col gap-4 mt-2">
      {/* ─── Card 1: RoboForex Registration (First Card) ────────────────────── */}
      <div className="w-full rounded-xl bg-[#010312] border border-secondary/15 p-5 sm:p-6 flex flex-col justify-between gap-5 relative shadow-sm text-on-dark">
        {/* Top Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto sm:absolute sm:top-5 sm:right-6">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold border ${
              isConnectedToRoboForex
                ? "bg-success/25 text-success border-success/40"
                : "bg-background/10 text-on-dark/70 border-background/20"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isConnectedToRoboForex ? "bg-success" : "bg-background/40"
              }`}
            />
            {isConnectedToRoboForex ? "Account Linked" : "Not Connected"}
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-sm font-mono bg-background/10 border border-background/20 text-on-dark/90">
            {isConnectedToRoboForex && brokerIdDisplay
              ? `Broker ID: ${brokerIdDisplay}`
              : "Not Linked"}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Info & CTA */}
          <div className="flex flex-col gap-2.5 max-w-2xl">
            <h3 className="text-lg font-medium font-inter text-on-dark tracking-tight">
              RoboForex Registration
            </h3>

            <p className="text-xs text-on-dark/80 leading-relaxed max-w-xl">
              To access all platform features, please register your Trackmarkets
              account exclusively using this button. Registering through
              Trackmarkets ensures proper linking and synchronization between
              both accounts.
            </p>

            <div className="pt-2 flex items-center gap-3">
              {isConnectedToRoboForex ? (
                /* Already linked — just open RoboForex login */
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-on-dark hover:bg-accent/90 text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer"
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
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  <span>Login to RoboForex</span>
                </button>
              ) : awaitingConfirmation ? (
                /* Awaiting user confirmation — collect broker ID */
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  <label className="text-[11px] text-on-dark/60 font-medium">
                    Enter your RoboForex Account ID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={brokerIdInput}
                      onChange={(e) => {
                        setBrokerIdInput(e.target.value);
                        setLinkError("");
                      }}
                      placeholder="e.g. 28941054"
                      className="flex-1 px-3 py-2 rounded-lg bg-background/10 border border-background/20 text-on-dark text-sm font-mono placeholder:text-on-dark/30 focus:outline-none focus:border-accent/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmLinked}
                      disabled={isLinking}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-on-dark hover:bg-success/90 text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <span>{isLinking ? "Linking..." : "Confirm Link"}</span>
                    </button>
                  </div>
                  {linkError && (
                    <p className="text-[11px] text-error font-medium">
                      {linkError}
                    </p>
                  )}
                </div>
              ) : (
                /* Not connected — open RoboForex registration */
                <button
                  type="button"
                  onClick={handleConnectClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-on-dark hover:bg-accent/90 text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer"
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
                  <span>Connect to RoboForex</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Brand Mark */}
          <div className="flex items-center justify-start md:justify-end shrink-0 pr-4">
            <span className="font-inter font-semibold text-3xl sm:text-4xl text-on-dark/90 tracking-tight select-none">
              ROBOFOREX
            </span>
          </div>
        </div>

        {/* Warning Note */}
        <div className="pt-3 border-t border-background/10">
          <p className="text-[11px] text-accent font-medium tracking-wide">
            ● DO NOT REGISTER DIRECTLY ON THE ROBOFOREX PLATFORM, AS THE ACCOUNT
            WILL NOT BE SYNCHRONIZED. ●
          </p>
        </div>
      </div>

      {/* ─── Card 2: FoxAlgo ──────────────────────────────────────────────────── */}
      <div className="w-full rounded-xl bg-[#010312] border border-secondary/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative shadow-sm text-on-dark">
        {/* Left Side */}
        <div className="flex flex-col gap-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-accent/25 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3.5 text-accent"
              >
                <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a8.04 8.04 0 0 1-6.192 6.192l-1.192.24a1 1 0 0 0 0 1.96l1.192.24a8.04 8.04 0 0 1 6.192 6.192l.24 1.192a1 1 0 0 0 1.96 0l.24-1.192a8.04 8.04 0 0 1 6.192-6.192l1.192-.24a1 1 0 0 0 0-1.96l-1.192-.24a8.04 8.04 0 0 1-6.192-6.192l-.24-1.192ZM4.5 2a.75.75 0 0 0-.75.75v1.5H2.25a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5v-1.5A.75.75 0 0 0 4.5 2Z" />
              </svg>
            </div>
            <h3 className="text-base font-medium font-inter text-on-dark tracking-tight">
              FoxAlgo
            </h3>
          </div>

          <p className="text-sm text-on-dark/80 leading-relaxed">
            Automate your strategies with algorithmic AI trading and analytics.
          </p>

          <div className="pt-1">
            <a
              href={FOXALGO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-on-dark hover:bg-accent/90 text-sm font-semibold transition-all shadow-sm active:scale-98"
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
            </a>
          </div>
        </div>

        {/* Right Side Brand & Link */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-background/10 border border-background/20 flex items-center justify-center font-inter font-medium text-accent text-sm">
              AI
            </div>
            <span className="font-inter font-semibold text-2xl text-on-dark tracking-tight">
              FoxAlgo
            </span>
          </div>

          <a
            href={FOXALGO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-on-dark/70 hover:text-on-dark flex items-center gap-1 transition-colors"
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
          </a>
        </div>
      </div>

      {/* ─── Card 3: BIX Wallets & Debit Card ───────────────────────────────────── */}
      <div className="hidden w-full rounded-xl bg-secondary border border-secondary/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative shadow-sm text-on-dark">
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
            <h3 className="text-base font-medium font-inter text-on-dark tracking-tight">
              BIX Wallets & Debit Card
            </h3>
            <span className="text-sm text-on-dark/60">(Coming Soon)</span>
          </div>

          <p className="text-sm text-on-dark/80 leading-relaxed">
            Add an extra layer of security to your account.
          </p>

          <div className="pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-on-dark hover:bg-accent/90 text-sm font-semibold transition-all shadow-sm active:scale-98"
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
            <div className="size-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">
              ✦
            </div>
            <span className="font-inter font-semibold text-2xl text-on-dark tracking-tight">
              BIX
            </span>
          </div>

          <Link
            href="/dashboard/profile"
            className="text-sm text-on-dark/70 hover:text-on-dark flex items-center gap-1 transition-colors"
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
