"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useAppStore } from "@/src/lib/stores/appStore";

const ICON_SIZE = 4.5;
const STROKE_WIDTH = 1.5;

interface NavItemProps {
  name: string;
  icon: ReactNode;
  href: string;
  isActive: boolean;
  isDrawerOpen: boolean;
}

const NavItem = ({
  name,
  icon,
  href,
  isActive,
}: NavItemProps) => {
  return (
    <Link className="w-full" href={href}>
      <li
        className={`p-2 gap-2.5 w-full flex items-center rounded-md transition-colors duration-150 ${
          isActive
            ? "text-secondary bg-secondary/4 font-semibold"
            : "hover:bg-secondary/4 text-secondary/60 hover:text-secondary font-medium"
        }`}
      >
        <span className="shrink-0 flex items-center justify-center">
          {icon}
        </span>
        <span
          className="font-medium text-[0.83rem] whitespace-nowrap overflow-hidden transition-all duration-200 ease-out leading-none opacity-100 max-w-48 translate-x-0"
        >
          {name}
        </span>
      </li>
    </Link>
  );
};

const Divider = () => (
  <div className="w-full border-b border-subtext/30 my-2"></div>
);

export const Drawer = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isConnectedToStockTrader = useAppStore(
    (s) => s.isConnectedToStockTrader,
  );

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
        <div className="main flex-1 w-full flex flex-col p-1">
          <ul className="gap-1.5 w-full flex flex-col justify-center px-0.5 py-2">
            {/* ─── Section 1: Overview & Network ──────────────────────────── */}
            <NavItem
              name="Overview"
              href="/dashboard"
              isActive={pathname === "/dashboard"}
              isDrawerOpen={isDrawerOpen}
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

            <NavItem
              name="Network"
              href="/dashboard/network"
              isActive={pathname.startsWith("/dashboard/network")}
              isDrawerOpen={isDrawerOpen}
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
            />

            {/* ─── Section 2: Trading, Commissions & Broker ────────────────── */}
            <Divider />

            {isConnectedToStockTrader && (
              <>
                <NavItem
                  name="Trading"
                  href="/dashboard/trading"
                  isActive={pathname.startsWith("/dashboard/trading")}
                  isDrawerOpen={isDrawerOpen}
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
                />

                <NavItem
                  name="Commissions"
                  href="/dashboard/commissions"
                  isActive={pathname.startsWith("/dashboard/commissions")}
                  isDrawerOpen={isDrawerOpen}
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
                />

                <NavItem
                  name="Rewards"
                  href="/dashboard/rewards"
                  isActive={pathname.startsWith("/dashboard/rewards")}
                  isDrawerOpen={isDrawerOpen}
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
                        d="M13 5C13 6.10457 10.5376 7 7.5 7C4.46243 7 2 6.10457 2 5M13 5C13 3.89543 10.5376 3 7.5 3C4.46243 3 2 3.89543 2 5M13 5V9.45715C11.7785 9.82398 11 10.3789 11 11M2 5V17C2 18.1046 4.46243 19 7.5 19C8.82963 19 10.0491 18.8284 11 18.5429V11M2 9C2 10.1046 4.46243 11 7.5 11C8.82963 11 10.0491 10.8284 11 10.5429M2 13C2 14.1046 4.46243 15 7.5 15C8.82963 15 10.0491 14.8284 11 14.5429M22 11C22 12.1046 19.5376 13 16.5 13C13.4624 13 11 12.1046 11 11M22 11C22 9.89543 19.5376 9 16.5 9C13.4624 9 11 9.89543 11 11M22 11V19C22 20.1046 19.5376 21 16.5 21C13.4624 21 11 20.1046 11 19V11M22 15C22 16.1046 19.5376 17 16.5 17C13.4624 17 11 16.1046 11 15"
                        stroke="currentColor"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
              </>
            )}

            <NavItem
              name="KYC & Broker"
              href="/dashboard/kyc"
              isActive={pathname.startsWith("/dashboard/kyc")}
              isDrawerOpen={isDrawerOpen}
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
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              }
            />

            {/* ─── Section 3: Profile & Settings ──────────────────────────── */}
            <Divider />

            <NavItem
              name="Profile"
              href="/dashboard/profile"
              isActive={pathname.startsWith("/dashboard/profile")}
              isDrawerOpen={isDrawerOpen}
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
