"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useNotifications } from "@/src/lib/hooks/useNotifications";

const CATEGORIES = [
  { id: "ALL", label: "All Notifications" },
  { id: "COMMISSIONS", label: "Commissions" },
  { id: "NETWORK", label: "Network & Team" },
  { id: "SECURITY", label: "Security & KYC" },
  { id: "SYSTEM", label: "System" },
];

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllRead,
  } = useNotifications();

  const [activeCategory, setActiveCategory] = useState("ALL");

  const filtered = useMemo(() => {
    return notifications.filter(
      (n) => activeCategory === "ALL" || n.category === activeCategory,
    );
  }, [notifications, activeCategory]);

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-secondary text-lg font-medium font-inter">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-secondary/60 text-sm">
            Stay updated on your referral lineage, commissions, and system alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={isMarkingAllRead}
            onClick={() => markAllAsRead()}
            className="self-start sm:self-auto text-sm font-medium text-secondary/70 hover:text-secondary hover:underline cursor-pointer disabled:opacity-50"
          >
            {isMarkingAllRead ? "Marking as read..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="w-full rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-secondary/10 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[0.75rem] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-secondary text-background font-semibold"
                    : "bg-secondary/5 text-secondary/70 hover:text-secondary hover:bg-secondary/10"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="skeleton size-8 rounded-full" />
              <p className="text-secondary/40 text-sm">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-secondary/50 text-sm gap-1.5 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8 text-secondary/30 mb-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              <p className="font-medium text-secondary/80">No notifications found</p>
              <p className="text-secondary/40">You are all caught up!</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && markAsRead(item.id)}
                className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                  item.isRead
                    ? "bg-secondary/2 border-secondary/6 text-secondary/70"
                    : "bg-secondary/6 border-secondary/15 text-secondary shadow-2xs"
                }`}
              >
                {/* Left: Icon & Text */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      item.category === "COMMISSIONS"
                        ? "bg-success/15 text-success border border-success/25"
                        : item.category === "NETWORK"
                        ? "bg-accent/15 text-accent border border-accent/25"
                        : item.category === "SECURITY"
                        ? "bg-secondary/15 text-secondary border border-secondary/25"
                        : "bg-secondary/10 text-secondary/70"
                    }`}
                  >
                    {item.category === "COMMISSIONS" && (
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
                          d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    )}
                    {item.category === "NETWORK" && (
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
                          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                        />
                      </svg>
                    )}
                    {item.category === "SECURITY" && (
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
                          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                        />
                      </svg>
                    )}
                    {item.category === "SYSTEM" && (
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
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-secondary leading-snug">
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="size-1.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <p className="text-sm text-secondary/70 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] text-secondary/40 font-mono">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-medium text-accent hover:underline"
                        >
                          {item.actionLabel || "View Details"} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Dismiss button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  className="text-secondary/30 hover:text-secondary/80 text-sm p-1 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
