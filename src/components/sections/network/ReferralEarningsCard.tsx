"use client";

import React from "react";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

interface ReferralEarningsCardProps {
  earnings?: number;
  lotsDistributed?: number;
  bonusLabel?: string;
}

export const ReferralEarningsCard: React.FC<ReferralEarningsCardProps> = ({
  earnings = 34167.5,
  lotsDistributed = 2357.5,
  bonusLabel = "Bonus 1 & 2",
}) => {
  const formatted = formatCurrency(earnings, 2);
  const [integerPart, decimalPart] = formatted.split(".");

  return (
    <div className="item-card-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="w-fit py-1 px-2 rounded-full bg-secondary/6 border border-secondary/10 text-[0.7rem] font-semibold text-secondary/80">
            {bonusLabel}
          </div>
          <p className="text-secondary/50 font-medium text-xs mt-2">
            Total Referral Earnings
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
        <span className="text-success font-medium">+{lotsDistributed.toLocaleString()}</span>{" "}
        Lots distributed
      </p>
    </div>
  );
};

export default ReferralEarningsCard;
