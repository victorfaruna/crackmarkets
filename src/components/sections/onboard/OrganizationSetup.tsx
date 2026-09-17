"use client";

import { useOnboardStore } from "@/src/lib/stores/onboardStore";
import { useState, useEffect } from "react";
import ErrorMessage from "../../shared/ErrorMessage";
import Link from "next/link";
import InputWithIcon from "../../ui/InputWithIcon";
import { checkOrgHandle } from "@/src/lib/services/org";
import { useQuery } from "@tanstack/react-query";
import { orgKeys } from "@/src/lib/keys/org.keys";

const HANDLE_TEST_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;

function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const OrganizationSetup = () => {
  const { next, formData, setFormData } = useOnboardStore();
  const [error, setError] = useState<string>("");
  const orgName = formData.orgName;
  const orgHandle = formData.orgHandle;

  // Debounce the handle so we only hit the API after the user pauses typing.
  const debouncedHandle = useDebounce(orgHandle, 500);

  //Check organisation handle – fires automatically when debouncedHandle changes.
  const {
    data: orgHandleAvailability,
    isFetching,
    error: isOrgHandleError,
  } = useQuery({
    queryKey: orgKeys.checkHandle(debouncedHandle),
    queryFn: () => checkOrgHandle(debouncedHandle),
    enabled: !!(debouncedHandle && HANDLE_TEST_PATTERN.test(debouncedHandle)),
  });

  //Set organization name...
  const setOrgName = (value: string) => {
    setFormData({ orgName: value });
    setError("");
  };

  //Set organization handle...
  const setOrgHandle = (value: string) => {
    setFormData({ orgHandle: value });
    setError("");
  };

  const validateAndContinue = () => {
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!orgHandle.trim()) {
      setError("Organization Handle is required");
      return;
    }
    if (!HANDLE_TEST_PATTERN.test(orgHandle)) {
      setError(
        "IDs can only contain letters, numbers, and underscores (3–20 characters).",
      );
      return;
    }

    if (orgHandleAvailability?.data?.exists) {
      setError("Organization handle already exists");
      return;
    }

    if (isOrgHandleError || isFetching) {
      setError("Something went wrong, please try again");
      return;
    }

    next();
  };

  return (
    <div className="flex flex-col gap-5 items-center w-full max-w-md animate-fade-in">
      <div className="flex flex-col items-center gap-1">
        <p className="font-medium text-xl font-inter text-secondary text-center leading-none">
          Organization
        </p>
        <p className="text-subtext font-medium text-center">
          Tell us about your company or organization
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-secondary/70">
              Organization Name
            </label>
            <InputWithIcon
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g Trackmarkets Ltd"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                  className="size-5 text-subtext"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                  />
                </svg>
              }
            />
          </div>
          {/* space */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-secondary/70 flex justify-between items-center">
              Trackmarkets Handle
              <Link
                href=""
                className="text-accent font-medium text-sm flex items-center gap-1"
              >
                Learn more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </Link>
            </label>
            <div className="w-full flex items-center gap-2 h-10 rounded-xl bg-primary border border-subtext/60 px-3 text-secondary placeholder:text-secondary/30 outline-none focus-within:border-accent/50 transition-colors">
              <p className="text-secondary/70 font-semibold">@trackmarkets /</p>
              <input
                type="text"
                value={orgHandle}
                onChange={(e) => setOrgHandle(e.target.value)}
                placeholder="e.g trackmarkets-team"
                className="border-none outline-none flex-1"
              />
              {orgHandle && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`size-4 ${
                    isFetching
                      ? "text-secondary/50"
                      : orgHandleAvailability?.data?.exists == false
                        ? "text-success"
                        : "text-error"
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          {error && <ErrorMessage error={error} />}
        </div>
      </div>
      <div className="flex gap-5 w-full max-w-md">
        <button
          onClick={validateAndContinue}
          className="w-fit px-10 mx-auto flex  items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-primary py-3 whitespace-nowrap transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default OrganizationSetup;
