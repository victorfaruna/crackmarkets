"use client";
import React, { useCallback, useEffect, useRef } from "react";

interface RightSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

const RightSideDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  width = "w-105",
}: RightSideDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close when clicking overlay
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-100 transition-opacity duration-200 ease-out ${
          isOpen
            ? "bg-secondary/40 backdrop-blur-xs opacity-100 pointer-events-auto"
            : "bg-transparent opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
        aria-hidden={!isOpen}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 z-120 h-full right-0 ${width} max-w-full flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full h-full bg-background border-l border-subtext/30 shadow-2xl flex flex-col">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-subtext/30">
            <h3 className="font-medium text-sm text-secondary">
              {title || "Withdraw"}
            </h3>
            <button
              onClick={onClose}
              className="size-7 rounded-full flex items-center justify-center text-secondary/50 hover:text-secondary hover:bg-secondary/5 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>
  );
};

export default RightSideDrawer;
