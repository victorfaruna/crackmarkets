"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/src/lib/stores/appStore";
import DashboardBrand from "./DashboardBrand";
import DashboardSearch from "./DashboardSearch";
import RightHeaderMenu from "../shared/RightHeaderMenu";

interface HeaderProps {
  isMobileNavigationOpen: boolean;
  onToggleMobileNavigation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileNavigationOpen,
  onToggleMobileNavigation,
}) => {
  const isConnectedToRoboForex = useAppStore(
    (s) => s.isConnectedToRoboForex,
  );

  return (
    <header className="navbar relative z-90 h-19 min-h-19 w-full shrink-0 gap-3 border-b border-on-dark/5 bg-shell-background px-3 text-on-dark sm:px-5 lg:gap-10 lg:px-7">
      <button
        type="button"
        onClick={onToggleMobileNavigation}
        aria-label={isMobileNavigationOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isMobileNavigationOpen}
        aria-controls="dashboard-navigation"
        className="btn btn-ghost btn-square size-11 shrink-0 border-0 text-on-dark hover:bg-on-dark/10 lg:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5">
          <path strokeLinecap="round" d={isMobileNavigationOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
        </svg>
      </button>
      <Link className="shrink-0" href={isConnectedToRoboForex ? "/dashboard" : "/dashboard/profile"}>
        <DashboardBrand />
      </Link>

      <div className="hidden min-w-0 max-w-132 flex-1 md:block">
        <DashboardSearch />
      </div>
      <div className="ml-auto shrink-0">
        <RightHeaderMenu />
      </div>
    </header>
  );
};

export default Header;
