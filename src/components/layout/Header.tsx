"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/src/lib/stores/appStore";
import DashboardBrand from "./DashboardBrand";
import DashboardSearch from "./DashboardSearch";
import RightHeaderMenu from "../shared/RightHeaderMenu";

export const Header: React.FC = () => {
  const isConnectedToRoboForex = useAppStore(
    (s) => s.isConnectedToRoboForex,
  );

  return (
    <header className="navbar relative z-90 h-19 min-h-19 w-full shrink-0 gap-6 border-b border-on-dark/5 bg-shell-background px-5 text-on-dark lg:gap-10 lg:px-7">
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
