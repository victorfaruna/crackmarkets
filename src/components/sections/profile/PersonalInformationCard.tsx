"use client";

import React, { useState } from "react";
import { useUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";
import {
  getProfileImage,
  getUserPlaceholderImage,
} from "@/src/lib/utils/profileHandler";

export const PersonalInformationCard: React.FC = () => {
  const { data: serverUserData, isLoading } = useUser();
  const storeUser = useUserStore((s) => s.user);

  // Authenticated live user data from /api/auth/me, fallback to store
  const user = serverUserData?.data?.user || storeUser;

  const firstName = user?.first_name || (user as any)?.firstName || "";
  const lastName = user?.last_name || (user as any)?.lastName || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    (user?.email ? user.email.split("@")[0] : "");

  const email = user?.email || "";
  const phoneNumber = user?.phone_number || "";
  const country = user?.country || "";
  const referralCode = user?.referral_code || "";
  const referredBy = user?.referred_by_id || "";
  const role = user?.role === "USER" ? "Partner" : user?.role || "Partner";

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toISOString().split("T")[0]
    : "";

  const avatarUrl = fullName
    ? getUserPlaceholderImage(email)
    : "/images/v1/placeholder.webp";

  // Preference switches
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [showNameToUpline, setShowNameToUpline] = useState(false);

  return (
    <div className="w-full rounded-2xl border border-secondary/10 bg-primary/40 p-6 sm:p-7 flex flex-col gap-6 shadow-xs">
      {/* ─── Card Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-secondary/10">
        <div>
          <h2 className="text-lg sm:text-xl font-medium font-clash-display text-secondary tracking-tight">
            Personal Information
          </h2>
          <p className="text-xs text-secondary/60 mt-0.5">
            Review your profile details.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-secondary/15 bg-secondary/5 hover:bg-secondary/10 text-secondary text-xs font-medium transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
            className="size-3.5 text-secondary/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
          <span>Edit Profile</span>
        </button>
      </div>

      {/* ─── Profile Content Body ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Left Circular Avatar */}
        <div className="shrink-0">
          <div className="size-20 sm:size-22 rounded-full overflow-hidden bg-secondary/10 border border-secondary/15 flex items-center justify-center">
            {isLoading && !user ? (
              <div className="skeleton size-full rounded-full" />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || "User Avatar"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = "/images/v1/placeholder.webp";
                }}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-12 text-secondary/40"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Right Info Section */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* User Full Name */}
          <div>
            {isLoading && !fullName ? (
              <div className="skeleton w-44 h-6 rounded-md" />
            ) : (
              <h3 className="text-xl sm:text-2xl font-semibold text-secondary tracking-tighter truncate">
                {fullName || "—"}
              </h3>
            )}
          </div>

          {/* Inline Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Account Type */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-secondary/5 border border-secondary/10 text-secondary/80">
              <span className="text-secondary/50">Account Type:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-3 text-accent"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.376 0C5.26 16.563 2 12.162 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75ZM10 4.316a13.447 13.447 0 0 1-5.992 2.458C4.004 8.784 4 10.87 4 12c0 3.79 2.378 7.172 6 8.57 3.622-1.398 6-4.78 6-8.57 0-1.13-.004-3.216-.008-5.226A13.447 13.447 0 0 1 10 4.316Z"
                    clipRule="evenodd"
                  />
                </svg>
                {role}
              </span>
            </div>

            {/* ID */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-secondary/5 border border-secondary/10 text-secondary/80">
              <span className="text-secondary/50">ID:</span>
              <span className="font-semibold text-secondary font-mono">
                {referralCode || "—"}
              </span>
            </div>

            {/* StockTrader ID */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-secondary/5 border border-secondary/10 text-secondary/80">
              <span className="text-secondary/50">StockTrader ID:</span>
              <span className="font-semibold text-secondary font-mono">
                {referralCode || "—"}
              </span>
            </div>

            {/* Joined */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-secondary/5 border border-secondary/10 text-secondary/80">
              <span className="text-secondary/50">Joined:</span>
              <span className="font-medium text-secondary font-mono">
                {joinedDate || "—"}
              </span>
            </div>

            {/* Referrer */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-secondary/5 border border-secondary/10 text-secondary/80">
              <span className="text-secondary/50">Referrer:</span>
              <span className="font-medium text-secondary">
                {referredBy ? "Active" : "N/A"}
              </span>
            </div>
          </div>

          {/* 3-Column Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 pt-2 text-xs text-secondary/80">
            {/* 1. Birthday / Date */}
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-secondary/40 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              <span className="truncate">{joinedDate || "—"}</span>
            </div>

            {/* 2. Email Address */}
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-secondary/40 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              <span className="truncate">{email || "—"}</span>
            </div>

            {/* 3. Phone Number */}
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-secondary/40 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              <span className="truncate">{phoneNumber || "—"}</span>
            </div>

            {/* 4. Telegram */}
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4 text-secondary/40 shrink-0"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
              </svg>
              <span className="truncate text-secondary/40">—</span>
            </div>

            {/* 5. Country */}
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-secondary/40 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                />
              </svg>
              <span className="truncate">{country || "—"}</span>
            </div>

            {/* 6. Living Address */}
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-secondary/40 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span className="truncate text-secondary/40">—</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Preference & Privacy Toggles ────────────────────────────────────── */}
      <div className="pt-4 border-t border-secondary/10 flex flex-col gap-3">
        {/* Toggle 1: Receive Notifications */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={receiveNotifications}
            onClick={() => setReceiveNotifications(!receiveNotifications)}
            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
              receiveNotifications ? "bg-secondary" : "bg-secondary/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-3.5 my-auto transform rounded-full bg-background transition duration-200 ease-in-out ${
                receiveNotifications ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-xs font-medium text-secondary">
            Receive Notifications
          </span>
        </label>

        {/* Toggle 2: Show name to upline */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={showNameToUpline}
            onClick={() => setShowNameToUpline(!showNameToUpline)}
            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
              showNameToUpline ? "bg-secondary" : "bg-secondary/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-3.5 my-auto transform rounded-full bg-background transition duration-200 ease-in-out ${
                showNameToUpline ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-secondary">
              Show First and Last Name to Upline
            </span>
            <span className="text-[11px] text-secondary/50">
              Otherwise only USER ID will be shared
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PersonalInformationCard;
