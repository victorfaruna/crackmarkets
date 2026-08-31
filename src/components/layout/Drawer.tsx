"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
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
  <Link className="w-full" href={href}>
    <li
      className={`p-2 gap-2.5 w-full flex items-center rounded-md transition-colors duration-150 ${
        isActive
          ? "text-secondary bg-secondary/4 font-semibold"
          : "hover:bg-secondary/4 text-secondary/60 hover:text-secondary font-medium"
      }`}
    >
      <span className="shrink-0 flex items-center justify-center">{icon}</span>
      <span className="font-medium text-[0.83rem] whitespace-nowrap overflow-hidden leading-none">
        {name}
      </span>
    </li>
  </Link>
);

/* ─── SubNavItem (indented child link) ────────────────────────────────── */

interface SubNavItemProps {
  name: string;
  href: string;
  isActive: boolean;
}

const SubNavItem = ({ name, href, isActive }: SubNavItemProps) => (
  <Link className="w-full" href={href}>
    <li
      className={`py-3 pl-11 pr-2 w-full flex items-center rounded-md transition-colors duration-150 ${
        isActive
          ? "text-secondary font-semibold"
          : "text-secondary/50 hover:text-secondary/80 font-medium"
      }`}
    >
      <span className="text-[0.78rem] whitespace-nowrap overflow-hidden leading-none">
        {name}
      </span>
    </li>
  </Link>
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
  const [isOpen, setIsOpen] = useState(false);

  // Auto-expand when a child route is active
  useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [isAnyChildActive]);

  return (
    <li className="w-full flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 gap-2.5 w-full flex items-center rounded-md transition-colors duration-150 cursor-pointer ${
          isAnyChildActive
            ? "text-secondary bg-secondary/4 font-semibold"
            : "hover:bg-secondary/4 text-secondary/60 hover:text-secondary font-medium"
        }`}
      >
        <span className="shrink-0 flex items-center justify-center">
          {icon}
        </span>
        <span className="font-medium text-[0.83rem] whitespace-nowrap overflow-hidden leading-none flex-1 text-left">
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
            isOpen ? "rotate-180" : ""
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
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-0.5 pt-0.5">{children}</ul>
      </div>
    </li>
  );
};

/* ─── Divider ─────────────────────────────────────────────────────────── */

const Divider = () => (
  <div className="w-full border-b border-subtext/30 my-2"></div>
);

/* ─── Drawer ──────────────────────────────────────────────────────────── */

export const Drawer = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isConnectedToRoboForex = useAppStore((s) => s.isConnectedToRoboForex);
  const isWalletDrawerOpen = useAppStore((s) => s.isWalletDrawerOpen);
  const setWalletDrawerOpen = useAppStore((s) => s.setWalletDrawerOpen);

  // Active state helpers
  const isNetworkActive = pathname.startsWith("/dashboard/network");
  const isTradingActive = pathname.startsWith("/dashboard/trading");
  const isRewardsActive = pathname.startsWith("/dashboard/rewards");
  const isCommissionsActive = pathname.startsWith("/dashboard/commissions");

  return (
    <aside
      onMouseEnter={() => setIsDrawerOpen(true)}
      onMouseLeave={() => setIsDrawerOpen(false)}
      className="relative w-55 h-full shrink-0 z-30"
    >
      <div
        className={`flex bg-background absolute left-0 top-0 z-20 h-full items-center justify-between flex-col gap-6 px-1 pb-8 border-r-[0.5px] border-subtext/30 shadow-xs transition-all duration-200 ease-out overflow-hidden ${
          isDrawerOpen ? "w-55" : "w-55"
        }`}
      >
        <div className="main flex-1 w-full flex flex-col p-1 overflow-y-auto">
          <ul className="gap-1 w-full flex flex-col justify-center px-0.5 py-2">
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

            {/* ─── Wallet (triggers withdrawal drawer) ─────────────── */}
            <li className="w-full">
              <button
                type="button"
                onClick={() => setWalletDrawerOpen(true)}
                className={`p-2 gap-2.5 w-full flex items-center rounded-md transition-colors duration-150 cursor-pointer ${
                  isWalletDrawerOpen
                    ? "text-secondary bg-secondary/4 font-semibold"
                    : "hover:bg-secondary/4 text-secondary/60 hover:text-secondary font-medium"
                }`}
              >
                <span className="shrink-0 flex items-center justify-center">
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
                </span>
                <span className="font-medium text-[0.83rem] whitespace-nowrap overflow-hidden leading-none">
                  Wallet
                </span>
              </button>
            </li>

            {/* ─── Events ─────────────────────────────────────────── */}
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

            {/* ─── Trading (collapsible, gated) ────────────────────── */}
            {isConnectedToRoboForex && (
              <CollapsibleGroup
                name="Trading"
                isAnyChildActive={isTradingActive}
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
                  href="/dashboard/trading"
                  isActive={isTradingActive}
                />
              </CollapsibleGroup>
            )}
          </ul>
        </div>

        <div className="flex items-end">
          <button
            data-tip="24/7 Support"
            className="tooltip tooltip-right size-10 rounded-full bg-primary flex items-center text-subtext justify-center hover:text-secondary cursor-pointer shrink-0 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-headphones-icon lucide-headphones size-5"
            >
              <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Drawer;
