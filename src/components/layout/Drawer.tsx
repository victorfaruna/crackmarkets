"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { DashboardMark } from "./DashboardBrand";
import { useAppStore } from "@/src/lib/stores/appStore";

const ICON_SIZE = 4.5;
const STROKE_WIDTH = 1.5;

/* ─── NavItem (flat link) ─────────────────────────────────────────────── */

interface NavItemProps {
  name: string;
  icon: ReactNode;
  href: string;
  isActive: boolean;
}

const NavItem = ({ name, icon, href, isActive }: NavItemProps) => (
  <li className="w-full">
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`relative min-h-11 px-3.5 py-2 gap-3 w-full flex items-center rounded-lg transition-colors duration-150 ${
        isActive
          ? "text-on-dark bg-shell-surface before:absolute before:left-0 before:inset-y-1 before:w-0.5 before:rounded-full before:bg-shell-accent"
          : "hover:bg-on-dark/5 text-on-dark/65 hover:text-on-dark"
      }`}
    >
      <span
        className={`shrink-0 flex items-center justify-center ${isActive ? "text-shell-accent" : ""}`}
      >
        {icon}
      </span>
      <span className="text-[0.83rem] whitespace-nowrap overflow-hidden leading-none">
        {name}
      </span>
    </Link>
  </li>
);

/* ─── SubNavItem (indented child link) ────────────────────────────────── */

interface SubNavItemProps {
  name: string;
  href: string;
  isActive: boolean;
}

const SubNavItem = ({ name, href, isActive }: SubNavItemProps) => (
  <li className="w-full">
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`py-3 pl-12 pr-2 w-full flex items-center rounded-md transition-colors duration-150 ${
        isActive ? "text-on-dark" : "text-on-dark/65 hover:text-on-dark"
      }`}
    >
      <span className="text-[0.78rem] whitespace-nowrap overflow-hidden leading-none">
        {name}
      </span>
    </Link>
  </li>
);

/* ─── CollapsibleGroup (parent with expandable children) ──────────────── */

interface CollapsibleGroupProps {
  name: string;
  icon: ReactNode;
  isAnyChildActive: boolean;
  children: ReactNode;
}

const CollapsibleGroup = ({
  name,
  icon,
  isAnyChildActive,
  children,
}: CollapsibleGroupProps) => {
  const [isOpen, setIsOpen] = useState(isAnyChildActive);
  const expanded = isAnyChildActive || isOpen;

  return (
    <li className="w-full flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={expanded}
        className={`relative min-h-11 px-3.5 py-2 gap-3 w-full flex items-center rounded-lg transition-colors duration-150 cursor-pointer ${
          isAnyChildActive
            ? "text-on-dark bg-shell-surface font-medium"
            : "hover:bg-on-dark/5 text-on-dark/65 hover:text-on-dark"
        }`}
      >
        <span className="shrink-0 flex items-center justify-center">
          {icon}
        </span>
        <span className="text-[0.83rem] whitespace-nowrap overflow-hidden leading-none flex-1 text-left">
          {name}
        </span>
        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`size-3.5 shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Children with smooth collapse */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-0.5 pt-0.5">{children}</ul>
      </div>
    </li>
  );
};

/* ─── Divider ─────────────────────────────────────────────────────────── */

/* ─── Drawer ──────────────────────────────────────────────────────────── */

export const Drawer = ({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isConnectedToRoboForex = useAppStore((s) => s.isConnectedToRoboForex);

  // Active state helpers
  const isNetworkActive = pathname.startsWith("/dashboard/network");
  const isAnalyticsActive =
    pathname.startsWith("/dashboard/analytics") ||
    pathname.startsWith("/dashboard/trading");
  const isRewardsActive = pathname.startsWith("/dashboard/rewards");
  const isCommissionsActive = pathname.startsWith("/dashboard/commissions");

  return (
    <aside
      id="dashboard-navigation"
      aria-label="Dashboard navigation"
      onMouseEnter={() => setIsDrawerOpen(true)}
      onMouseLeave={() => setIsDrawerOpen(false)}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) onCloseMobile();
      }}
      className={`fixed bottom-0 left-0 top-19 z-50 h-auto w-57 shrink-0 transition-transform duration-200 lg:relative lg:top-auto lg:bottom-auto lg:z-30 lg:h-full lg:translate-x-0 lg:visible ${
        mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
      }`}
    >
      <div
        className={`flex bg-shell-background absolute left-0 top-0 z-20 h-full items-center justify-between flex-col gap-6 px-2.5 pb-15 transition-all duration-200 ease-out overflow-hidden ${
          isDrawerOpen ? "w-57" : "w-57"
        }`}
      >
        <DrawerChart />
        <div className="relative min-h-0 flex-1 w-full flex flex-col overflow-y-auto pt-10">
          <ul className="gap-1.5 w-full flex flex-col justify-center py-1">
            {/* ─── Overview (flat, gated) ───────────────────────────── */}
            {isConnectedToRoboForex && (
              <NavItem
                name="Overview"
                href="/dashboard"
                isActive={pathname === "/dashboard"}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`size-${ICON_SIZE + 0.5}`}
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
                  </svg>
                }
              />
            )}

            {/* ─── Profile (flat, always visible) ──────────────────── */}
            <NavItem
              name="Profile"
              href="/dashboard/profile"
              isActive={pathname.startsWith("/dashboard/profile")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={STROKE_WIDTH}
                  stroke="currentColor"
                  className={`size-${ICON_SIZE}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              }
            />

            {/* ─── Wallet (conditional to RoboForex integration) ── */}

            <NavItem
              name="Wallet"
              href="/dashboard/wallet"
              isActive={pathname.startsWith("/dashboard/wallet")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={STROKE_WIDTH}
                  stroke="currentColor"
                  className={`size-${ICON_SIZE}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                  />
                </svg>
              }
            />

            {/* ─── Events (conditional to RoboForex integration) ─── */}

            <NavItem
              name="Events"
              href="/dashboard/events"
              isActive={pathname.startsWith("/dashboard/events")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={STROKE_WIDTH}
                  stroke="currentColor"
                  className={`size-${ICON_SIZE}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              }
            />

            {/* ─── My Network (collapsible, always visible) ─────────── */}
            <CollapsibleGroup
              name="My Network"
              isAnyChildActive={isNetworkActive}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={STROKE_WIDTH}
                  stroke="currentColor"
                  className={`size-${ICON_SIZE}`}
                >
                  <path
                    d="M16 3.46776C17.4817 4.20411 18.5 5.73314 18.5 7.5C18.5 9.26686 17.4817 10.7959 16 11.5322M18 16.7664C19.5115 17.4503 20.8725 18.565 22 20M2 20C3.94649 17.5226 6.58918 16 9.5 16C12.4108 16 15.0535 17.5226 17 20M14 7.5C14 9.98528 11.9853 12 9.5 12C7.01472 12 5 9.98528 5 7.5C5 5.01472 7.01472 3 9.5 3C11.9853 3 14 5.01472 14 7.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              <SubNavItem
                name="Network"
                href="/dashboard/network"
                isActive={pathname === "/dashboard/network"}
              />
              <SubNavItem
                name="My Global Affiliates"
                href="/dashboard/network?view=global"
                isActive={pathname === "/dashboard/network"}
              />
              <SubNavItem
                name="My Top Affiliates"
                href="/dashboard/network?view=top"
                isActive={pathname === "/dashboard/network"}
              />
            </CollapsibleGroup>

            {/* ─── My Commissions (collapsible, gated) ─────────────── */}
            {isConnectedToRoboForex && (
              <CollapsibleGroup
                name="My Commissions"
                isAnyChildActive={isCommissionsActive || isRewardsActive}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={STROKE_WIDTH}
                    stroke="currentColor"
                    className={`size-${ICON_SIZE}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                }
              >
                <SubNavItem
                  name="Commissions"
                  href="/dashboard/commissions"
                  isActive={isCommissionsActive}
                />
                <SubNavItem
                  name="Rewards & Incentives"
                  href="/dashboard/rewards"
                  isActive={isRewardsActive}
                />
              </CollapsibleGroup>
            )}

            {/* ─── Analytics (collapsible, gated) ────────────────── */}
            {isConnectedToRoboForex && (
              <CollapsibleGroup
                name="Analytics"
                isAnyChildActive={isAnalyticsActive}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={STROKE_WIDTH}
                    stroke="currentColor"
                    className={`size-${ICON_SIZE}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                    />
                  </svg>
                }
              >
                <SubNavItem
                  name="Trading Analytics"
                  href="/dashboard/analytics"
                  isActive={isAnalyticsActive}
                />
              </CollapsibleGroup>
            )}
          </ul>
        </div>

        <div className="card relative mx-2 shrink-0 self-stretch rounded-xl border border-on-dark/20 bg-linear-to-br from-shell-surface/60 to-shell-background p-5 text-center text-on-dark shadow-inner shadow-on-dark/5">
          <DashboardMark size={30} className="text-center mx-auto" />
          <p className="text-sm font-semibold">
            Trade Smarter.
            <br />
            <span className="text-shell-accent">Grow</span> Further.
          </p>
          <a
            href="https://my.roboforex.com/en/?a=lazwx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline mt-4 h-9 min-h-9 w-full gap-2 rounded-lg border-on-dark/60 bg-shell-background/50 text-xs font-medium text-on-dark shadow-none hover:border-shell-accent hover:bg-shell-surface"
          >
            Trade Now
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-5-5 5 5-5 5"
              />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Drawer;

// Decorative market motif; this is not a chart of account or broker data.
function DrawerChart() {
  const candles = [
    [8, 290, 34],
    [27, 268, 27],
    [46, 248, 39],
    [65, 225, 30],
    [84, 232, 22],
    [103, 196, 37],
    [122, 166, 44],
    [141, 172, 26],
    [160, 137, 34],
    [179, 111, 32],
    [198, 84, 39],
    [217, 63, 35],
  ];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,var(--shell-surface),transparent_75%)]" />
      <svg
        className="absolute top-1/3 h-90 w-full text-shell-accent opacity-12"
        viewBox="0 0 228 360"
        fill="none"
      >
        <path
          d="M-15 285 20 245 58 229 91 190 131 181 167 140 195 108 240 61"
          stroke="currentColor"
          opacity=".35"
        />
        {candles.map(([x, y, height]) => (
          <g key={x}>
            <path
              d={`M${x + 4} ${y - 10}v${height + 20}`}
              stroke="currentColor"
            />
            <rect
              x={x}
              y={y}
              width="8"
              height={height}
              rx="1"
              fill="currentColor"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
