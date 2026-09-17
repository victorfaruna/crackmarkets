"use client";
import React, { useEffect, useRef, useState } from "react";
import { useLogout } from "@/src/lib/hooks/useAuth";
import { useUser } from "@/src/lib/hooks/useUser";
import { useAppStore } from "@/src/lib/stores/appStore";
import { useUserStore, UserProfile } from "@/src/lib/stores/userStore";
import { useNotifications } from "@/src/lib/hooks/useNotifications";
import Link from "next/link";
import Image from "next/image";
import { getUserPlaceholderImage } from "@/src/lib/utils/profileHandler";

const RightHeaderMenu = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userStore = useUserStore((s) => s.user);
  const { data: userQueryData } = useUser();
  const { unreadCount } = useNotifications();

  // Combine query data with userStore fallback
  const user: UserProfile | null = userQueryData?.data?.user || userStore;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative flex text-secondary/70 items-center gap-3 justify-end"
    >
      <button className="flex items-center gap-1.5 border-[0.5px] border-subtext/60 rounded-full py-2 px-3 bg-primary ">
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
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <p className="text-sm font-medium text-subtext mr-3">Search</p>
        <div className="flex gap-0 items-center">
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 9V6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H9ZM9 9V15M9 9H15M9 15V18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15H9ZM9 15H15M15 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18V15ZM15 15V9M15 9V6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9H15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-medium">K</p>
        </div>
      </button>

      <Link
        href="/dashboard/notifications"
        className="round-button relative"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          color="currentColor"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M15.5 18C15.5 19.933 13.933 21.5 12 21.5C10.067 21.5 8.5 19.933 8.5 18" />
          <path d="M19.2311 18H4.76887C3.79195 18 3 17.208 3 16.2311C3 15.762 3.18636 15.3121 3.51809 14.9803L4.12132 14.3771C4.68393 13.8145 5 13.0514 5 12.2558V9.5C5 5.63401 8.13401 2.5 12 2.5C15.866 2.5 19 5.634 19 9.5V12.2558C19 13.0514 19.3161 13.8145 19.8787 14.3771L20.4819 14.9803C20.8136 15.3121 21 15.762 21 16.2311C21 17.208 20.208 18 19.2311 18Z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-accent animate-pulse" />
        )}
      </Link>

      <button
        id="profile-image"
        className="cursor-pointer"
        onClick={() => setOpen((a) => !a)}
      >
        <Image
          unoptimized
          src={getUserPlaceholderImage(user?.email || "default")}
          alt="Profile Image"
          className="bg-primary rounded-full size-7.5 border-[0.5px] border-subtext/60"
          width={50}
          height={50}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = getUserPlaceholderImage(user?.email || "default");
          }}
        />
      </button>

      {/* Dropdown */}
      {open && <UserInfo />}
    </div>
  );
};

export default RightHeaderMenu;

const UserInfo = () => {
  const { initLogout } = useLogout();
  const { isLoading, data } = useUser();
  const userStore = useUserStore((s) => s.user);
  const user = data?.data?.user || userStore;

  const THEMES = ["dark", "light"] as const;
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  const fullName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || (user?.email ? user.email.split("@")[0] : "");

  const handleSelectTheme = (selectedTheme: "dark" | "light") => {
    setTheme(selectedTheme);
  };

  return (
    <div
      id="org-switcher-dropdown"
      className="absolute text-secondary top-full right-3 mt-1 w-75 bg-background border border-subtext/30 rounded-xl z-50 animate-fade-in shadow-2xl shadow-base-300 overflow-hidden"
    >
      <div className="p-4 border-b border-subtext/30 font-medium flex items-center justify-between">
        <div>
          {isLoading && !fullName ? (
            <p className="skeleton w-28 h-3 rounded-xl"></p>
          ) : (
            <p className="text-sm leading-none">{fullName || "Trader"}</p>
          )}
          {isLoading && !user?.email ? (
            <p className="skeleton w-15 h-2 rounded-xl mt-1"></p>
          ) : (
            <p className="text-sm text-secondary/50 mt-1">
              {user?.email || ""}
            </p>
          )}
        </div>
        {isLoading && !user ? (
          <p className="skeleton size-6 rounded-full"></p>
        ) : (
          <a
            href="/dashboard/profile"
            aria-label="Profile Settings"
            className="hover:text-secondary text-secondary/40 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </a>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto px-4 py-2 gap-1 flex flex-col">
        <p className="font-medium text-sm text-secondary/60">Theme</p>
        <div className="flex w-full flex-col items-start font-medium">
          {THEMES.map((t, i) => (
            <button
              key={i}
              type="button"
              className="text-sm capitalize w-full text-start flex items-center gap-3 p-1.5 pl-4 rounded-sm hover:bg-subtext/15 cursor-pointer"
              onClick={() => handleSelectTheme(t)}
            >
              <span
                className={`size-1.5 rounded-full ${
                  theme === t
                    ? "bg-secondary/90"
                    : "bg-transparent border border-subtext/60"
                }`}
              ></span>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-subtext/30">
        <button
          type="button"
          onClick={() => initLogout()}
          className="w-full text-error flex font-medium items-center gap-2 p-4 rounded-sm hover:bg-error/5 cursor-pointer"
        >
          {isLoading && !user ? (
            <p className="skeleton w-15 h-3"></p>
          ) : (
            <>
              <p className="text-sm font-medium leading-none">Logout</p>
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
                  d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
