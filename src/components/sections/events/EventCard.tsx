"use client";

import React, { useState, useEffect } from "react";
import { EventItem, EventCategory } from "@/src/lib/services/events";
import {
  downloadIcsFile,
  getGoogleCalendarUrl,
  getCountdown,
} from "@/src/lib/utils/calendar";

interface EventCardProps {
  event: EventItem;
}

const CATEGORY_BADGE_STYLE: Record<
  EventCategory,
  { label: string; badge: string; border: string; bg: string }
> = {
  TRADING_CONTEST: {
    label: "Trading Contest",
    badge: "text-error bg-error/15 border-error/25",
    border: "border-error/20",
    bg: "from-error/20 to-transparent",
  },
  WEBINAR: {
    label: "Webinar",
    badge: "text-accent bg-accent/15 border-accent/25",
    border: "border-accent/20",
    bg: "from-accent/20 to-transparent",
  },
  PARTNER_SUMMIT: {
    label: "Summit",
    badge: "text-success bg-success/15 border-success/25",
    border: "border-success/20",
    bg: "from-success/20 to-transparent",
  },
  LEADERSHIP_POOL: {
    label: "Leadership Pool",
    badge: "text-secondary bg-secondary/15 border-secondary/25",
    border: "border-secondary/20",
    bg: "from-secondary/20 to-transparent",
  },
};

export default function EventCard({ event }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(() => getCountdown(event.starts_at));

  // Live countdown ticker every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(event.starts_at));
    }, 60000);
    return () => clearInterval(timer);
  }, [event.starts_at]);

  const startDate = new Date(event.starts_at);
  const monthShort = startDate.toLocaleDateString("en-US", { month: "short" });
  const dayNumber = startDate.getDate();
  const timeFormatted = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const catStyle = CATEGORY_BADGE_STYLE[event.category] || {
    label: event.category,
    badge: "text-accent bg-accent/15 border-accent/25",
    border: "border-accent/20",
    bg: "from-accent/20 to-transparent",
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${event.title} - ${event.location} (${startDate.toLocaleDateString()})\n${window.location.href}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-secondary/6 bg-primary/40 p-4 sm:p-5 flex flex-col gap-4 shadow-2xs hover:border-secondary/12 transition-all">
      {/* ─── Main Row ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Thumbnail + Info */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Date Badge / Thumbnail Pill */}
          <div
            className={`relative size-16 sm:size-20 rounded-lg shrink-0 overflow-hidden border border-secondary/8 flex flex-col items-center justify-center bg-gradient-to-br ${catStyle.bg} bg-primary/80`}
          >
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider text-background bg-secondary shadow-xs uppercase">
              {monthShort} {dayNumber}
            </span>
            <span className="text-[10px] text-secondary/60 mt-1 font-mono">
              {startDate.getFullYear()}
            </span>
          </div>

          {/* Event Details */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-secondary tracking-tight truncate max-w-full">
                {event.title}
              </h2>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-3 text-sm text-secondary/60 flex-wrap">
              <div className="flex items-center gap-1">
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
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>{timeFormatted}</span>
              </div>

              <span>|</span>

              <div className="flex items-center gap-1">
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
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {/* Add to Calendar Button */}
              <button
                type="button"
                onClick={() => downloadIcsFile(event)}
                className="px-3 py-1 text-sm font-medium rounded-lg border border-secondary/15 bg-primary hover:bg-secondary/10 text-secondary transition-colors cursor-pointer flex items-center gap-1.5"
                title="Download iCal (.ics) file"
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                Add to Calendar
              </button>

              {/* Google Calendar Link */}
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm font-medium rounded-lg bg-accent text-background font-semibold hover:bg-accent/90 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Join / RSVP
              </a>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="size-7 rounded-lg border border-secondary/15 bg-primary hover:bg-secondary/10 flex items-center justify-center text-secondary/70 hover:text-secondary transition-colors cursor-pointer"
                title="Share event link"
              >
                {copied ? (
                  <span className="text-[10px] text-success font-bold">✓</span>
                ) : (
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
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Status Badge + Countdown + Accordion toggle */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-secondary/10">
          <div className="flex items-center gap-2">
            {/* Published / Status pill */}
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${catStyle.badge}`}
            >
              {catStyle.label}
            </span>

            {/* Countdown / Status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary border border-secondary/10 text-secondary/80">
              <span>🔥</span>
              <span>{countdown.text}</span>
            </div>

            {/* Accordion Chevron */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="size-7 rounded-lg border border-secondary/15 bg-primary hover:bg-secondary/10 flex items-center justify-center text-secondary/70 hover:text-secondary transition-colors cursor-pointer"
              aria-label="Expand event details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`size-3.5 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Expandable Description & Details ──────────────────────────── */}
      {isExpanded && (
        <div className="pt-3 border-t border-secondary/10 flex flex-col gap-3 text-sm animate-fadeIn">
          <div>
            <span className="font-semibold text-secondary">Description: </span>
            <p className="text-secondary/70 mt-1 leading-relaxed">
              {event.description || "No specific details provided."}
            </p>
          </div>

          {event.reward_pool && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/10 border border-accent/20">
              <span className="text-base">🏆</span>
              <span className="font-semibold text-accent">Reward Pool:</span>
              <span className="text-secondary font-mono">{event.reward_pool}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-secondary/50 font-mono pt-1">
            <span>Event ID: {event.id.slice(0, 8)}...</span>
            <span>Starts: {new Date(event.starts_at).toUTCString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
