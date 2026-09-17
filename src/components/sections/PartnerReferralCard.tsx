"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";
import { getProfileImage } from "@/src/lib/utils/profileHandler";

export const PartnerReferralCard: React.FC = () => {
  const { data: serverUserData, isLoading } = useUser();
  const storeUser = useUserStore((s) => s.user);

  // Prefer live server data, fallback to persisted store
  const user = serverUserData?.data?.user || storeUser;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const referralCode = user?.referral_code || "";
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "Member Trader";
  const email = user?.email || "";
  const phone = user?.phone_number || "";
  const avatarUrl = getProfileImage(fullName);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";

  const referralLink = referralCode
    ? `${appUrl}/register?ref=${referralCode}`
    : appUrl;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Trackmarkets Partner Referral",
          text: `Join my trading network on Trackmarkets: ${referralLink}`,
          url: referralLink,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="w-full rounded-2xl bg-primary border-[0.5px] border-secondary/7 p-5 flex flex-col justify-between gap-4 animate-pulse min-h-60">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-secondary/10 rounded-md" />
          <div className="size-9 bg-secondary/10 rounded-xl" />
        </div>
        <div className="h-10 w-full bg-secondary/10 rounded-xl" />
        <div className="h-28 w-full bg-secondary/10 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-primary/50 border-[0.5px] border-secondary/7 p-5 flex flex-col justify-between gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-secondary font-inter tracking-tighter text-lg font-medium tracking-tight">
          Partner
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={handleShare}
            data-tip={shared ? "Link Copied!" : "Share"}
            aria-label="Share referral link"
            className="tooltip tooltip-left size-9 rounded-xl bg-background border border-secondary/15 flex items-center justify-center text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all cursor-pointer"
          >
            {shared ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 text-success"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
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
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Referral Link Bar */}
      <div className="w-full rounded-xl bg-background border-[0.5px] border-secondary/15 px-3 py-2 flex items-center justify-between gap-2 shadow-2xs">
        <span className="text-sm font-mono text-secondary/80 truncate select-all">
          {referralLink}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy referral link"
          className="size-7 rounded-lg hover:bg-secondary/8 text-secondary/70 hover:text-secondary flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4 text-success"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
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
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Dark Partner Identity Sub-card */}
      <div className="w-full rounded-2xl p-2 flex items-start gap-4 text-secondary ">
        {/* QR Code with custom logo center */}
        <div className="relative shrink-0 p-4 bg-background rounded-xl shadow-sm flex items-center justify-center">
          <QRCodeSVG
            value={referralLink}
            size={200}
            level="L"
            radius={24}
            imageSettings={{
              src: avatarUrl,
              height: 24,
              width: 24,

              excavate: true,
            }}
          />
        </div>

        {/* User Identity Details from Server */}
        <div className="flex flex-col justify-center gap-1.5 min-w-0 p-2">
          <h3 className="text-xl font-medium text-secondary tracking-tight truncate leading-tight">
            {fullName}
          </h3>

          {email && (
            <div className="flex items-center gap-2 text-secondary/70 text-sm truncate">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3.5 shrink-0 text-secondary/60"
              >
                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
              </svg>
              <span className="truncate font-mono text-[11px]">{email}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2 text-secondary/70 text-sm truncate">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3.5 shrink-0 text-secondary/60"
              >
                <path
                  fillRule="evenodd"
                  d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="truncate font-mono text-[11px]">{phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerReferralCard;
