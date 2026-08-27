"use client";

import React from "react";

interface ActiveOrganizationCardProps {
  activeCount?: number;
  totalCount?: number;
  directPartners?: number;
  depthsCount?: number;
}

export const ActiveOrganizationCard: React.FC<ActiveOrganizationCardProps> = ({
  activeCount = 447,
  totalCount = 607,
  directPartners = 18,
  depthsCount = 10,
}) => {
  return (
    <div className="item-card-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="w-fit py-1 px-2 rounded-full bg-secondary/6 border border-secondary/10 text-[0.7rem] font-semibold text-secondary/80">
            {depthsCount} Depths
          </div>
          <p className="text-secondary/50 font-medium text-xs mt-2">
            Active Organization
          </p>
          <div className="font-clash-display flex items-end text-[1.8rem] font-semibold text-secondary leading-none">
            <span>{activeCount}</span>
            <span className="text-sm text-subtext leading-none ml-1.5 font-satoshi font-normal">
              / {totalCount} Total
            </span>
          </div>
        </div>
      </div>
      <p className="text-secondary/60 text-[0.75rem] mt-3">
        <span className="text-accent font-medium">{directPartners} direct</span>{" "}
        Level 1 team partners
      </p>
    </div>
  );
};

export default ActiveOrganizationCard;
