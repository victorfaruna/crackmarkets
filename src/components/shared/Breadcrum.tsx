"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Breadcrum = () => {
  const pathname = usePathname();
  const pathway = pathname.split("/").filter((item) => item !== "");

  return (
    <div className="flex font-medium items-center gap-1.5 text-secondary/60">
      {pathway.map((item, index) => (
        <div key={index} className="flex gap-1.5 items-center capitalize">
          <p className="flex items-center text-[0.8rem] leading-none">{item}</p>

          {index !== pathway.length - 1 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="size-2.5 text-subtext"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrum;

