"use client";

import React from "react";
import Link from "next/link";
import Logo from "../shared/Logo";
import Breadcrum from "../shared/Breadcrum";
import RightHeaderMenu from "../shared/RightHeaderMenu";

export const Header: React.FC = () => {
  return (
    <header className="w-full z-90 bg-background top-0 flex border-b border-subtext/30 items-center py-2 px-5 shrink-0">
      <div className="inner relative h-full w-full gap-4 items-center flex justify-between">
        <Link href="/dashboard">
          <Logo />
        </Link>

        <span className="text-subtext text-sm">/</span>

        <span className="font-medium text-xs sm:text-sm text-secondary truncate">
          Crack Markets
        </span>

        <span className="text-subtext text-sm">/</span>

        <nav className="flex flex-1 justify-start">
          <Breadcrum />
        </nav>

        <RightHeaderMenu />
      </div>
    </header>
  );
};

export default Header;
