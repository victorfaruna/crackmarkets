"use client";

import React, { useState, useEffect } from "react";
import { useUser, useUpdateUser } from "@/src/lib/hooks/useUser";
import { useUserStore } from "@/src/lib/stores/userStore";
import { useAppStore } from "@/src/lib/stores/appStore";
import { getUserPlaceholderImage } from "@/src/lib/utils/profileHandler";
import { COUNTRIES } from "@/src/lib/constants/countries";

export const PersonalInformationCard: React.FC = () => {
  const { data: serverUserData, isLoading } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const isConnectedToRoboForex = useAppStore(
    (s) => s.isConnectedToRoboForex,
  );
  const { mutateAsync: updateUserMutation, isPending: isUpdating } =
    useUpdateUser();

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
  const telegramHandle = user?.telegram_handle || "";
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

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Prepopulate edit form when modal opens
  const handleOpenEditModal = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setEditPhoneNumber(phoneNumber);
    setEditCountry(country || COUNTRIES[0]?.name || "United States");
    setEditTelegram(telegramHandle.replace(/^@+/, ""));
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    if (!editFirstName.trim() || !editLastName.trim()) {
      setEditError("First name and last name are required.");
      return;
    }

    if (!editPhoneNumber.trim()) {
      setEditError("Phone number is required.");
      return;
    }

    try {
      const res = await updateUserMutation({
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        phone_number: editPhoneNumber.trim(),
        country: editCountry.trim(),
        telegram_handle: editTelegram.trim() ? editTelegram.trim() : undefined,
      });

      if (res.success) {
        setEditSuccess("Profile updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 700);
      } else {
        setEditError(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred.";
      setEditError(msg);
    }
  };

  return (
    <>
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
            onClick={handleOpenEditModal}
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

              {/* RoboForex ID */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-secondary/5 border border-secondary/10 text-secondary/80">
                <span className="text-secondary/50">RoboForex ID:</span>
                <span
                  className={`font-semibold font-mono ${
                    isConnectedToRoboForex
                      ? "text-secondary"
                      : "text-secondary/40"
                  }`}
                >
                  {isConnectedToRoboForex
                    ? (user as any)?.roboforex_id || "—"
                    : "Not Linked"}
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
                <span className={`truncate ${telegramHandle ? "text-secondary" : "text-secondary/40"}`}>
                  {telegramHandle ? `@${telegramHandle.replace(/^@+/, "")}` : "—"}
                </span>
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

      {/* ─── Edit Profile Modal ────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-background border-[0.5px] border-secondary/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-[0.5px] border-secondary/10">
              <div>
                <h3 className="font-semibold text-sm text-secondary">
                  Edit Personal Information
                </h3>
                <p className="text-[11px] text-secondary/60">
                  Update your contact details and identity information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="size-7 rounded-lg flex items-center justify-center text-secondary/50 hover:text-secondary hover:bg-secondary/5 cursor-pointer text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveProfile}
              className="flex flex-col gap-4 text-xs text-secondary"
            >
              {/* Feedback Alerts */}
              {editError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-medium">
                  {editSuccess}
                </div>
              )}

              {/* First Name & Last Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-secondary/70 text-[11px]">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                    className="w-full h-10 px-3.5 rounded-xl border-[0.5px] border-secondary/15 bg-secondary/4 text-secondary text-xs outline-hidden focus:border-secondary/40 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-secondary/70 text-[11px]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                    className="w-full h-10 px-3.5 rounded-xl border-[0.5px] border-secondary/15 bg-secondary/4 text-secondary text-xs outline-hidden focus:border-secondary/40 transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-secondary/70 text-[11px]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-10 px-3.5 rounded-xl border-[0.5px] border-secondary/15 bg-secondary/4 text-secondary text-xs outline-hidden focus:border-secondary/40 transition-colors"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-secondary/70 text-[11px]">
                  Country of Residence
                </label>
                <select
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border-[0.5px] border-secondary/15 bg-secondary/4 text-secondary text-xs outline-hidden focus:border-secondary/40 transition-colors cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Telegram Handle */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-secondary/70 text-[11px]">
                    Telegram Handle
                  </label>
                  <span className="text-[10px] text-secondary/40">Optional</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-secondary/40 text-xs font-mono select-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={editTelegram}
                    onChange={(e) =>
                      setEditTelegram(e.target.value.replace(/^@+/, ""))
                    }
                    placeholder="username"
                    className="w-full h-10 pl-8 pr-3.5 rounded-xl border-[0.5px] border-secondary/15 bg-secondary/4 text-secondary text-xs outline-hidden focus:border-secondary/40 transition-colors"
                  />
                </div>
              </div>

              {/* Read-Only Email */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-secondary/70 text-[11px]">
                    Email Address
                  </label>
                  <span className="text-[10px] text-secondary/40">
                    Primary Identifier
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-10 px-3.5 rounded-xl border-[0.5px] border-secondary/10 bg-secondary/2 text-secondary/50 text-xs cursor-not-allowed outline-hidden"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t-[0.5px] border-secondary/10 mt-1">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border-[0.5px] border-secondary/15 text-secondary/70 hover:text-secondary hover:bg-secondary/5 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-full bg-secondary text-background font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalInformationCard;
