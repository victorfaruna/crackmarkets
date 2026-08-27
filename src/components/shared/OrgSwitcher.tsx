"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetOrgs } from "@/src/lib/hooks/useOrg";
import { useOrgStore } from "@/src/lib/stores/orgStore";
import { getProfileImage } from "@/src/lib/utils/profileHandler";
import Link from "next/link";

const OrgSwitcher = () => {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading } = useGetOrgs();
  const org = useOrgStore((s) => s.org);
  const setOrg = useOrgStore((s) => s.setOrg);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync the active org from the URL param
  useEffect(() => {
    if (!data?.data || !params?.orgHandle) return;
    const match = data.data.find(
      (o: any) => o.slug === params.orgHandle || o.id === params.orgHandle,
    );
    if (match && match.id !== org?.id) {
      setOrg({
        id: match.id,
        name: match.name,
        slug: match.slug,
        logoUrl: match.logoUrl,
        totalMembers: match.totalMembers,
        currency: match.currency,
        subscriptionTier: match.subscriptionTier,
      });
    }
  }, [data, params?.orgHandle]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const orgs: any[] = data?.data ?? [];

  const handleSwitch = (item: any) => {
    setOrg({
      id: item.id,
      name: item.name,
      slug: item.slug,
      logoUrl: item.logoUrl,
      totalMembers: item.totalMembers,
      currency: item.currency,
      subscriptionTier: item.subscriptionTier,
    });
    setOpen(false);
    router.push(`/dashboard/${item.slug}`);
  };

  // Loading skeleton
  if (isLoading || !org) {
    return <div className="skeleton w-28 h-2.5 rounded-md"></div>;
  }

  return (
    <div className="" ref={dropdownRef}>
      {/* Active org trigger */}
      <div className="font-medium h-full flex items-center gap-2 rounded-md transition-colors">
        <Link
          href={"/dashboard/" + org.slug}
          className="flex items-center gap-1 font-medium text-[0.85rem] leading-none"
        >
          <svg
            className="size-3.75 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 11H4.6C4.03995 11 3.75992 11 3.54601 11.109C3.35785 11.2049 3.20487 11.3578 3.10899 11.546C3 11.7599 3 12.0399 3 12.6V21M16.5 11H19.4C19.9601 11 20.2401 11 20.454 11.109C20.6422 11.2049 20.7951 11.3578 20.891 11.546C21 11.7599 21 12.0399 21 12.6V21M16.5 21V6.2C16.5 5.0799 16.5 4.51984 16.282 4.09202C16.0903 3.71569 15.7843 3.40973 15.408 3.21799C14.9802 3 14.4201 3 13.3 3H10.7C9.57989 3 9.01984 3 8.59202 3.21799C8.21569 3.40973 7.90973 3.71569 7.71799 4.09202C7.5 4.51984 7.5 5.0799 7.5 6.2V21M22 21H2M11 7H13M11 11H13M11 15H13"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {org.name}
          {org.subscriptionTier && (
            <OrgSubscriptionStatusPill tier={org.subscriptionTier} />
          )}
        </Link>

        {/* Chevron up/down icon */}
        <button
          data-tip="Switch Org"
          className="p-1 rounded-lg hover:bg-secondary/5 tooltip tooltip-bottom"
          id="org-switcher-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`size-4.5 text-secondary/90 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          id="org-switcher-dropdown"
          className="absolute top-full left-0 mt-0 w-85 bg-background border border-subtext/30 rounded-xl z-50 overflow-hidden"
        >
          <div className="p-3 border-b border-subtext/30">
            <p className="text-xs font-semibold tracking-wider">
              Organizations
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 gap-1 flex flex-col">
            {orgs.map((item: any) => {
              const isActive = item.id === org.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSwitch(item)}
                  className={`w-full flex items-center gap-2 p-2.5 text-secondary/90 text-left transition-colors rounded-md ${
                    isActive ? "bg-subtext/20" : "hover:bg-secondary/5"
                  }`}
                >
                  <img
                    src={item.logoUrl || getProfileImage(item.slug)}
                    alt={item.name}
                    className="size-4 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = getProfileImage(item.slug);
                    }}
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[0.83rem] font-medium truncate">
                      {item.name}
                    </span>
                    {item.subscriptionTier && (
                      <OrgSubscriptionStatusPill tier={item.subscriptionTier} />
                    )}
                  </div>

                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-3 ml-auto shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-subtext/30">
            <button className="w-full flex items-center gap-2 p-4 rounded-sm text-secondary/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5H4.25a.75.75 0 0 1 0-1.5h5.5V3.75A.75.75 0 0 1 10 3Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs font-medium">New Organization</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSwitcher;

export const OrgSubscriptionStatusPill = ({ tier }: { tier: string }) => {
  return (
    <span className="px-2 py-1 rounded-full bg-accent/15 text-accent text-[0.6rem] font-semibold capitalize leading-none">
      {tier}
    </span>
  );
};
