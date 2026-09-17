"use client";

import React, { useState, useMemo } from "react";
import Breadcrum from "@/src/components/shared/Breadcrum";
import EventCalendarWidget from "@/src/components/sections/events/EventCalendarWidget";
import EventCard from "@/src/components/sections/events/EventCard";
import { useEvents } from "@/src/lib/hooks/useEvents";

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "ALL", label: "All Categories" },
  { key: "TRADING_CONTEST", label: "Trading Contest" },
  { key: "PARTNER_SUMMIT", label: "Partner Summit" },
  { key: "WEBINAR", label: "Webinar" },
  { key: "LEADERSHIP_POOL", label: "Leadership Pool" },
];

export default function EventsPage() {
  // Calendar month state
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  // Selected day string: "YYYY-MM-DD" or null
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  // Past events toggle
  const [includePast, setIncludePast] = useState<boolean>(false);

  // Form month query string e.g. "2026-09"
  const currentMonthStr = useMemo(() => {
    const y = calendarDate.getFullYear();
    const m = String(calendarDate.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [calendarDate]);

  // Fetch all events for the current month and upcoming to populate calendar dots & list
  const { data: eventsResponse, isLoading, error } = useEvents({
    include_past: includePast,
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    date: selectedDay || undefined,
  });

  // Also query month-wide events for the calendar markers
  const { data: monthEventsResponse } = useEvents({
    include_past: true,
    month: currentMonthStr,
  });

  const events = eventsResponse?.data || [];
  const monthEvents = monthEventsResponse?.data || [];

  return (
    <section className="w-full max-w-330 min-h-full pt-5 px-5 pb-16 flex flex-col gap-5">
      {/* ─── Top Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <Breadcrum />
        <h1 className="text-secondary text-lg font-medium font-inter mt-1">
          Events & Competitions
        </h1>
        <p className="text-secondary/60 text-sm">
          Participate in live trading championships, global partner summits, webinars, and leadership reward snapshots.
        </p>
      </div>

      {/* ─── Two-Column Layout ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ─── Left Column: Calendar & Widget ─────────────────────────── */}
        <div className="w-full lg:w-85 shrink-0 flex flex-col gap-4">
          <EventCalendarWidget
            currentDate={calendarDate}
            onDateChange={setCalendarDate}
            selectedDate={selectedDay}
            onSelectDate={setSelectedDay}
            events={monthEvents}
          />

          {/* Quick Notice Card */}
          <div className="rounded-lg border border-secondary/6 bg-primary/30 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <span className="text-sm font-semibold text-secondary font-inter">
                Automated Calendar Sync
              </span>
            </div>
            <p className="text-[11px] text-secondary/60 leading-relaxed">
              Click any event date to filter schedules. Use the &quot;Add to Calendar&quot; button on cards to export directly to Apple, Google, or Outlook.
            </p>
          </div>
        </div>

        {/* ─── Right Column: Filters & Event Cards ────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
          {/* Top Filter Bar */}
          <div className="rounded-lg border border-secondary/6 bg-primary/40 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            {/* Left Controls: Category Dropdown & Date Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select select-sm bg-primary border border-secondary/8 text-secondary text-sm rounded-md focus:outline-none focus:border-accent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key} className="bg-primary text-secondary">
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Active Selected Day Tag */}
              {selectedDay && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-medium bg-secondary text-background shadow-xs">
                  <span>📅 {selectedDay}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="hover:opacity-70 font-bold ml-1 cursor-pointer"
                    title="Clear date filter"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Right Controls: Past Events Toggle */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <label className="text-sm text-secondary/70 font-medium select-none cursor-pointer flex items-center gap-2">
                <span>Include past events</span>
                <input
                  type="checkbox"
                  checked={includePast}
                  onChange={(e) => setIncludePast(e.target.checked)}
                  className="toggle toggle-sm toggle-accent"
                />
              </label>
            </div>
          </div>

          {/* ─── Event Cards List ─────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-secondary/10 bg-primary/20 p-5 h-28 animate-pulse flex items-center gap-4"
                >
                  <div className="size-16 rounded-xl bg-secondary/10 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-secondary/10 rounded-md w-2/3" />
                    <div className="h-3 bg-secondary/10 rounded-md w-1/3" />
                    <div className="h-6 bg-secondary/10 rounded-md w-1/4 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-error/20 bg-error/10 p-6 text-center text-sm text-error">
              Failed to load events. Please try refreshing the page.
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-secondary/10 bg-primary/20 p-10 flex flex-col items-center justify-center gap-3 text-center">
              <span className="text-3xl">🗓️</span>
              <h3 className="text-sm font-semibold text-secondary font-inter">
                No events found
              </h3>
              <p className="text-sm text-secondary/60 max-w-sm">
                {selectedDay
                  ? `No scheduled events on ${selectedDay}. Try selecting another date or viewing all upcoming schedules.`
                  : "No events match your current filter criteria."}
              </p>
              {(selectedDay || selectedCategory !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedCategory("ALL");
                  }}
                  className="mt-2 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-secondary text-background hover:bg-secondary/90 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
