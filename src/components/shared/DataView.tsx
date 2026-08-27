import Link, { LinkProps } from "next/link";
import React from "react";

interface DataViewProps {
  children?: React.ReactNode;
  title?: string;
  buttonURL?: LinkProps["href"];
}

const DataView = ({ children, title, buttonURL }: DataViewProps) => {
  return (
    <div className="w-full h-full rounded-4xl bg-primary p-4">
      {/* header */}
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-secondary text-xl font-medium">{title}</p>
          <p className="text-3xl font-normal font-rubik">$9,5678.45</p>
        </div>
        <div>
          <TopRightButton />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

export const TopRightButton = () => (
  <button className="size-12 rounded-full bg-background text-secondary/40 flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={4.5}
      stroke="currentColor"
      className="size-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
      />
    </svg>
  </button>
);

export default DataView;
