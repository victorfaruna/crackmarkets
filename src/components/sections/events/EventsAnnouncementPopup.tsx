"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const POPUP_STORAGE_KEY = "tm_leadership_popup_dismissed";

export default function EventsAnnouncementPopup() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Show popup once per session (not once per day – per session)
    const dismissed = sessionStorage.getItem(POPUP_STORAGE_KEY);
    if (!dismissed) {
      // Small delay so the page content renders first
      const timer = setTimeout(() => {
        setVisible(true);
        setAnimating(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setAnimating(false);
    sessionStorage.setItem(POPUP_STORAGE_KEY, "true");
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        animating ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Leadership Package Target announcement"
    >
      {/* Modal container – stop click propagation so clicking the image doesn't close */}
      <div
        className={`relative max-w-sm w-full transition-all duration-300 ${
          animating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          id="events-announcement-popup-close"
          className="absolute -top-3 -right-3 z-10 size-8 rounded-full bg-secondary text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer font-bold text-sm leading-none"
          aria-label="Close announcement"
        >
          ✕
        </button>

        {/* Image card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <Image
            src="/images/leadership-package-target.jpg"
            alt="Leadership Package Target – 15 Leaders Only | TrackMarkets × RoboForex"
            width={683}
            height={1024}
            className="w-full h-auto block"
            priority
          />
        </div>

        {/* CTA strip */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary/60 text-secondary/70 border border-secondary/10 hover:bg-primary/80 transition-colors cursor-pointer font-inter"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-shell-accent text-shell-background hover:opacity-90 transition-opacity cursor-pointer font-inter shadow-md"
          >
            I&apos;m Interested 🏆
          </button>
        </div>
      </div>
    </div>
  );
}
