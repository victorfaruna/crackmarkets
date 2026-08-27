"use client";

import React from "react";
import CurrencyPill from "@/src/components/shared/CurrencyPill";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

interface NetworkVolumeCardProps {
  volume?: number;
  currencyName?: string;
  currencyUrl?: string;
  strongLegPercentage?: number;
}

export const NetworkVolumeCard: React.FC<NetworkVolumeCardProps> = ({
  volume = 4714000,
  currencyName = "USDT",
  currencyUrl = "/images/stablecoins/usdt.png",
  strongLegPercentage = 52,
}) => {
  const formatted = formatCurrency(volume, 2);
  const [integerPart, decimalPart] = formatted.split(".");

  return (
    <div className="item-card-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <CurrencyPill
            currencyName={currencyName}
            currencyUrl={currencyUrl}
          />
          <p className="text-secondary/50 font-medium text-xs mt-2">
            Total Team Volume
          </p>
          <div className="font-clash-display flex items-end text-[1.8rem] font-semibold text-secondary leading-none">
            <span className="text-[1.3rem] mr-0.5 text-secondary/60 leading-none">
              $
            </span>
            <span>{integerPart}</span>
            <span className="text-sm text-subtext leading-none ml-0.5">
              .{decimalPart || "00"}
            </span>
          </div>
        </div>
      </div>
      <p className="text-secondary/60 text-[0.75rem] mt-3">
        <span className="text-secondary font-medium">{strongLegPercentage}%</span>{" "}
        Strong Leg volume qualification
      </p>
    </div>
  );
};

export default NetworkVolumeCard;
