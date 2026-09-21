"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { EventItem } from "@/src/lib/services/events";
import {
  downloadIcsFile,
  getCountdown,
  getGoogleCalendarUrl,
} from "@/src/lib/utils/calendar";

interface EventDetailsModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export default function EventDetailsModal({
  event,
  onClose,
}: EventDetailsModalProps) {
  useEffect(() => {
    if (!event) return;

    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [event, onClose]);

  if (!event) return null;

  const startsAt = new Date(event.starts_at);
  const endsAt = event.ends_at ? new Date(event.ends_at) : null;
  const countdown = getCountdown(event.starts_at, event.ends_at);
  const date = startsAt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = startsAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="fixed inset-0 z-[1000] bg-secondary/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-details-title"
      onMouseDown={onClose}
    >
      <div
        className="h-full w-full overflow-y-auto bg-background"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div className="mx-auto flex min-h-full w-full max-w-360 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-secondary/10 bg-background/95 px-5 py-4 backdrop-blur sm:px-8">
            <span className="text-sm font-semibold text-secondary">Event details</span>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-lg border border-secondary/15 bg-primary text-secondary transition-colors hover:bg-secondary/10"
              aria-label="Close event details"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
                <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <main className="flex flex-1 flex-col lg:flex-row">
            <div className="relative min-h-90 bg-shell-background lg:min-h-0 lg:w-[54%]">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={`${event.title} event artwork`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 54vw, 100vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex h-full min-h-90 items-center justify-center p-8 text-center lg:min-h-full">
                  <span className="rounded-full border border-on-dark/25 px-4 py-2 text-sm font-semibold text-on-dark/80">
                    Event artwork coming soon
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-7 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {event.category.replaceAll("_", " ")}
                </span>
                <span className="rounded-full border border-secondary/15 px-3 py-1 text-xs font-medium text-secondary/70">
                  {event.status === "COMPLETED" ? "Completed" : countdown.text}
                </span>
              </div>

              <div>
                <h1 id="event-details-title" className="text-3xl font-semibold tracking-tight text-secondary sm:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-4 text-base leading-7 text-secondary/70">
                  {event.description || "More event information will be announced soon."}
                </p>
              </div>

              <dl className="grid gap-4 border-y border-secondary/10 py-6 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-secondary/55">Date and time</dt>
                  <dd className="mt-1 font-medium text-secondary">{date} · {time}</dd>
                  {endsAt && (
                    <dd className="mt-1 text-secondary/65">
                      Ends {endsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {endsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-secondary/55">Location</dt>
                  <dd className="mt-1 font-medium text-secondary">{event.location || "To be announced"}</dd>
                </div>
                {event.reward_pool && (
                  <div>
                    <dt className="text-secondary/55">Reward pool</dt>
                    <dd className="mt-1 font-semibold text-accent">{event.reward_pool}</dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => downloadIcsFile(event)}
                  className="rounded-lg border border-secondary/15 bg-primary px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/10"
                >
                  Add to calendar
                </button>
                <a
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-background transition-colors hover:bg-accent/90"
                >
                  Open Google Calendar
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
