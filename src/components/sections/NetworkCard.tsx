"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useNetwork } from "@/src/lib/hooks/useNetwork";
import { getUserPlaceholderImage } from "@/src/lib/utils/profileHandler";

export const NetworkCard = () => {
  const { data, isLoading } = useNetwork();
  const networkData = data?.data;
  const members = networkData?.members || [];
  const totalCount = networkData?.totalMembers ?? 0;
  const activeCount = networkData?.activeCount ?? 0;

  return (
    <div className="item-card">
      {/* Bottom gradient overlay with view all link */}
      <div className="absolute left-0 bottom-0 w-full h-20 bg-linear-to-t from-primary via-primary/90 to-transparent z-10 pointer-events-none flex flex-col justify-end items-start p-4">
        <Link
          href="/dashboard/network"
          className="flex items-center gap-1 font-medium leading-none text-secondary hover:text-accent transition-colors pointer-events-auto text-sm"
        >
          View all
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-3"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
          </svg>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-secondary text-sm leading-none font-medium">
            Network
          </p>
          <p className="text-secondary/60 font-normal text-sm">
            {isLoading ? (
              <span className="text-secondary/40">Loading network...</span>
            ) : totalCount > 0 ? (
              <>
                You have{" "}
                <span className="text-secondary/90 font-medium">
                  {activeCount}
                </span>{" "}
                active {activeCount === 1 ? "trader" : "traders"} across 10 levels
              </>
            ) : (
              "No traders in your tree yet"
            )}
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && members.length === 0 && (
        <div className="flex-1 flex flex-col gap-4 pr-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-md bg-secondary/10 shrink-0" />
                <div className="h-3 w-28 bg-secondary/10 rounded" />
              </div>
              <div className="h-3 w-14 bg-secondary/10 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && members.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-6 px-4">
          <div className="size-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </div>
          <p className="text-secondary text-sm font-medium">No network members yet</p>
          <p className="text-secondary/50 text-[11px] max-w-[200px] leading-relaxed">
            Share your partner link to start growing your 10-level trading tree.
          </p>
        </div>
      )}

      {/* Real Traders List (Name and Level only) */}
      {members.length > 0 && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-4 pr-1 pb-16">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 py-0.5"
            >
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <Image
                  unoptimized
                  className="size-7 rounded-md bg-accent/20 object-cover shrink-0"
                  src={getUserPlaceholderImage(member.id + member.name)}
                  alt={member.name}
                  width={28}
                  height={28}
                />
                <p className="text-secondary leading-none font-medium capitalize truncate text-sm">
                  {member.name}
                </p>
              </div>

              {/* Right: Level Only */}
              <div className="flex items-center shrink-0">
                <span className="text-sm font-semibold text-accent font-inter">
                  Level {member.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkCard;
