"use client";

import React, { useMemo } from "react";
import { EventItem, EventCategory } from "@/src/lib/services/events";

interface EventCalendarWidgetProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedDate: string | null; // "YYYY-MM-DD" or null
  onSelectDate: (dateStr: string | null) => void;
  events: EventItem[];
}

const CATEGORY_COLORS: Record<
  EventCategory,
  { dot: string; label: string; bg: string; text: string }
> = {
  TRADING_CONTEST: {
    dot: "bg-error",
    label: "Trading Contest",
    bg: "bg-error/15",
    text: "text-error",
  },
  WEBINAR: {
    dot: "bg-accent",
    label: "Webinar",
    bg: "bg-accent/15",
    text: "text-accent",
  },
  PARTNER_SUMMIT: {
    dot: "bg-success",
    label: "Summit",
    bg: "bg-success/15",
    text: "text-success",
  },
  LEADERSHIP_POOL: {
    dot: "bg-secondary",
    label: "Leadership Pool",
    bg: "bg-secondary/15",
    text: "text-secondary",
  },
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function EventCalendarWidget({
  currentDate,
  onDateChange,
  selectedDate,
  onSelectDate,
  events,
}: EventCalendarWidgetProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    onDateChange(today);
    const todayStr = today.toISOString().split("T")[0];
    onSelectDate(todayStr);
  };

  // Group events by "YYYY-MM-DD" for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    events.forEach((evt) => {
      const d = new Date(evt.starts_at);
      const key = d.toISOString().split("T")[0];
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(evt);
    });
    return map;
  }, [events]);

  // Compute 42 calendar grid cells (6 rows * 7 days)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      events: EventItem[];
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, dayNum);
      const dateStr = prevMonthDate.toISOString().split("T")[0];
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        events: eventsByDate.get(dateStr) || [],
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const curDate = new Date(year, month, dayNum);
      // Format as YYYY-MM-DD with local padding
      const y = curDate.getFullYear();
      const m = String(curDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        events: eventsByDate.get(dateStr) || [],
      });
    }

    // Next month leading days to complete 35 or 42 cells
    const remaining = 42 - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthDate = new Date(year, month + 1, dayNum);
      const dateStr = nextMonthDate.toISOString().split("T")[0];
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        events: eventsByDate.get(dateStr) || [],
      });
    }

    return cells;
  }, [year, month, selectedDate, eventsByDate]);

  return (
    <div className="w-full rounded-lg border border-secondary/6 bg-primary/40 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
      {/* ─── Top Month Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToday}
          className="px-3 py-1 text-xs font-medium rounded-md border border-secondary/8 bg-primary/60 text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
        >
          Today
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="size-7 rounded-md border border-secondary/8 bg-primary/60 flex items-center justify-center text-secondary/70 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
            aria-label="Previous Month"
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
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <span className="font-clash-display font-semibold text-secondary text-sm sm:text-base px-2 select-none min-w-[130px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="size-7 rounded-md border border-secondary/8 bg-primary/60 flex items-center justify-center text-secondary/70 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
            aria-label="Next Month"
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
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Weekdays Header ────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-secondary/50 select-none pb-1 border-b border-secondary/6">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* ─── Days Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarCells.map((cell, idx) => {
          const hasEvents = cell.events.length > 0;
          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              type="button"
              onClick={() => {
                // If already selected, deselect
                if (cell.isSelected) {
                  onSelectDate(null);
                } else {
                  onSelectDate(cell.dateStr);
                }
              }}
              className={`relative h-9 sm:h-10 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all text-xs cursor-pointer ${
                cell.isSelected
                  ? "bg-secondary text-background font-bold shadow-xs scale-105"
                  : cell.isCurrentMonth
                    ? "text-secondary hover:bg-secondary/10 font-medium"
                    : "text-secondary/25 hover:text-secondary/50 font-normal"
              } ${cell.isToday && !cell.isSelected ? "border border-accent font-semibold text-accent" : ""}`}
            >
              <span>{cell.dayNumber}</span>

              {/* Event indicator dots */}
              {hasEvents && (
                <div className="flex items-center gap-0.5 -mt-0.5">
                  {cell.events.slice(0, 3).map((evt) => {
                    const colorConfig = CATEGORY_COLORS[evt.category];
                    return (
                      <span
                        key={evt.id}
                        className={`size-1.5 rounded-full ${
                          cell.isSelected ? "bg-background" : colorConfig?.dot || "bg-accent"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Category Legend ────────────────────────────────────────────── */}
      <div className="pt-3 border-t border-secondary/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-secondary/70">
        {Object.entries(CATEGORY_COLORS).map(([catKey, config]) => (
          <div key={catKey} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${config.dot}`} />
            <span className="capitalize">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
