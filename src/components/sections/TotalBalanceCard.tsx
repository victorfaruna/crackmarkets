"use client";
import React, { useState } from "react";
import CurrencyPill from "../shared/CurrencyPill";
import { useUser } from "@/src/lib/hooks/useUser";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";
import CommissionWithdrawalDrawer from "./CommissionWithdrawalDrawer";

interface TotalBalanceCardProps {
  initialData?: {
    currency?: {
      name?: string;
      logoUrl?: string;
      fiatSign?: string;
    };
  };
}

const TotalBalanceCard = ({ initialData }: TotalBalanceCardProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: userData, isLoading } = useUser();

  const wallet = userData?.data?.wallet;
  const rawBalance = wallet?.available_balance || wallet?.balance || "0.00";
  const numBalance = parseFloat(rawBalance) || 0;

  const currencyName = initialData?.currency?.name || "USDT";
  const currencyUrl =
    initialData?.currency?.logoUrl || "/images/stablecoins/usdt.png";
  const fiatSign = initialData?.currency?.fiatSign || "$";

  const formatted = formatCurrency(numBalance, 2);
  const [integerPart, decimalPart] = formatted.split(".");

  return (
    <>
      <div className="item-card">
        {/* underlay */}
        <div className="absolute z-1 inset-0 bg-[url(/images/card-mesh.webp)] bg-size-[300%] bg-no-repeat opacity-15"></div>
        {/* main */}
        <div className="flex flex-col gap-4 h-full relative z-2">
          {/* Top row */}
          <div className="flex justify-between items-center p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5.5 text-secondary/80"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
              />
            </svg>
          </div>

          <div className="mt-auto flex flex-col gap-6">
            {/* Balance row */}
            <div className="flex flex-col gap-1.5">
              <div className="w-fit">
                <CurrencyPill
                  currencyName={currencyName}
                  currencyUrl={currencyUrl}
                />
              </div>
              <p className="text-secondary/50 font-medium text-xs">
                Commission Balance
              </p>
              {isLoading && !userData ? (
                <p className="skeleton w-42 h-8 rounded-lg" />
              ) : (
                <div className="font-clash-display flex items-end text-[2rem] font-semibold text-secondary">
                  <span className="text-[1.5rem] mr-0.5 text-secondary/60 leading-none">
                    {fiatSign}
                  </span>
                  <span className="leading-none -mb-0.75">{integerPart}</span>
                  <span className="text-lg text-subtext leading-none">
                    .{decimalPart || "00"}
                  </span>
                </div>
              )}
              <p className="text-secondary/70 flex items-center text-xs gap-1 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4 text-accent"
                  color="currentColor"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16V12" />
                  <path d="M12.125 8.25H12M12.25 8.25C12.25 8.11193 12.1381 8 12 8C11.8619 8 11.75 8.11193 11.75 8.25C11.75 8.38807 11.8619 8.5 12 8.5C12.1381 8.5 12.25 8.38807 12.25 8.25Z" />
                </svg>
                Available for withdrawal:{" "}
                <span className="text-accent font-medium">Instant</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-auto">
              <ActionButton
                label="Withdraw"
                onClick={() => setDrawerOpen(true)}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-3.5"
                  >
                    <path
                      d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <ActionButton
                onClick={() => setDrawerOpen(true)}
                label="Transfer"
                className="hidden bg-secondary/2! border! border-secondary/6! hover:border-secondary/12!"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-3"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      strokeWidth={2}
                      d="M227.32,28.68a16,16,0,0,0-15.66-4.08l-.15,0L19.57,82.84a16,16,0,0,0-2.49,29.8L102,154l41.3,84.87A15.86,15.86,0,0,0,157.74,248q.69,0,1.38-.06a15.88,15.88,0,0,0,14-11.51l58.2-191.94c0-.05,0-.1,0-.15A16,16,0,0,0,227.32,28.68ZM157.83,231.85l-.05.14,0-.07-40.06-82.3,48-48a8,8,0,0,0-11.31-11.31l-48,48L24.08,98.25l-.07,0,.14,0L216,40Z"
                    ></path>
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <CommissionWithdrawalDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        availableBalance={numBalance}
        fiatSign={fiatSign}
      />
    </>
  );
};

export default TotalBalanceCard;

interface ActionButtonProps {
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  onClick?: () => void;
}

const ActionButton = ({
  icon,
  label,
  className,
  onClick,
}: ActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-fit px-8 h-11 border-secondary/3 flex items-center justify-center gap-1.5 rounded-full bg-secondary/5 text-secondary text-xs font-medium cursor-pointer hover:bg-secondary/12 transition-colors ${className || ""}`}
    >
      {label}
      {icon}
    </button>
  );
};
