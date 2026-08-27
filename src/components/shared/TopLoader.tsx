"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const TopLoader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUrlRef = useRef("");

  const startLoading = useCallback(() => {
    setProgress(0);
    setVisible(true);

    let current = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      current += current < 30 ? 8 : current < 60 ? 3 : current < 80 ? 1 : 0.3;
      if (current >= 90) {
        current = 90;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setProgress(current);
    }, 50);
  }, []);

  const completeLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 200);
  }, []);

  // Helper: check if a URL is a different route than current
  const isDifferentRoute = useCallback(
    (url: string) => {
      try {
        const parsed = new URL(url, window.location.origin);
        return parsed.pathname !== pathname;
      } catch {
        return false;
      }
    },
    [pathname],
  );

  // Complete loader when pathname changes
  useEffect(() => {
    const newUrl = pathname + (searchParams?.toString() || "");
    if (currentUrlRef.current && currentUrlRef.current !== newUrl) {
      completeLoading();
    }
    currentUrlRef.current = newUrl;
  }, [pathname, searchParams, completeLoading]);

  // Intercept <a> clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        target.target === "_blank"
      )
        return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      if (href !== pathname) {
        startLoading();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startLoading]);

  // Patch history.pushState & replaceState for programmatic navigation (router.push, etc.)
  // and listen for popstate (back/forward buttons)
  useEffect(() => {
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    const handleHistoryChange = (url?: string | URL | null) => {
      if (url && isDifferentRoute(String(url))) {
        startLoading();
      }
    };

    history.pushState = function (data, unused, url) {
      handleHistoryChange(url);
      return originalPushState(data, unused, url);
    };

    history.replaceState = function (data, unused, url) {
      handleHistoryChange(url);
      return originalReplaceState(data, unused, url);
    };

    const handlePopState = () => {
      // Back/forward always triggers — start the loader
      startLoading();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDifferentRoute, startLoading]);

  return (
    <div
      className="toploader-container"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="toploader-bar size-full bg-accent/80"
        style={{
          transform: `scaleX(${progress / 100})`,
          transition:
            progress === 0
              ? "none"
              : progress === 100
                ? "transform 0.2s ease-out"
                : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
};

export default TopLoader;
