/**
 * Calendar helpers for Trackmarkets events.
 * Generates .ics file download and Google Calendar URLs.
 */

import { EventItem } from "../services/events";

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Generates an .ics file data URL and triggers browser download
 */
export function downloadIcsFile(event: EventItem) {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at
    ? new Date(event.ends_at)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2h default

  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trackmarkets//Events Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@trackmarkets.io`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title.replace(/[,;]/g, " ")}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n").replace(/[,;]/g, " ")}`,
    `LOCATION:${(event.location || "Online").replace(/[,;]/g, " ")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  const objectUrl = window.URL.createObjectURL(blob);
  link.href = objectUrl;
  link.setAttribute(
    "download",
    `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}

/**
 * Generates a Google Calendar event creation URL
 */
export function getGoogleCalendarUrl(event: EventItem): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at
    ? new Date(event.ends_at)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: `${event.description || ""}\n\nReward Pool: ${event.reward_pool || "N/A"}`,
    location: event.location || "Online",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Calculates remaining time formatted as: "18 Days, 23 Hours, 32 Minutes"
 */
export function getCountdown(targetDate: string | Date, endDate?: string | Date | null): {
  isPast: boolean;
  text: string;
} {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    if (endDate && new Date(endDate).getTime() <= now) {
      return { isPast: true, text: "Completed" };
    }
    return { isPast: true, text: "Live / In Progress" };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return {
      isPast: false,
      text: `${days} ${days === 1 ? "Day" : "Days"}, ${hours} ${hours === 1 ? "Hour" : "Hours"}, ${minutes} Min`,
    };
  }

  return {
    isPast: false,
    text: `${hours} ${hours === 1 ? "Hour" : "Hours"}, ${minutes} Min`,
  };
}
