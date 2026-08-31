"use client";

import React from "react";
import Logo from "@/src/components/shared/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  centered?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  centered = false,
}) => {
  return (
    <section className="w-screen bg-background h-screen flex flex-row">
      {/* Left Hero Mesh Panel */}
      <div className="w-125 md:w-150 xl:w-175 hidden xl:block h-full relative rounded-r-4xl overflow-hidden bg-primary/60 border border-secondary/2 shrink-0">
        {/* underlay */}
        <div className="absolute z-1 inset-0 bg-[url(/images/card-mesh.webp)] bg-cover bg-no-repeat opacity-40"></div>

        <div className="size-full flex gap-4 flex-col justify-between p-10">
          <div className="flex items-center justify-start">
            {/* <Logo size={30} /> */}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-accent text-sm font-medium tracking-tight">
              Advanced Service Provider & Referral Network.
            </p>
            <p className="text-3xl font-semibold tracking-tight text-secondary/80 leading-none font-clash-display">
              Trade Markets, <br />
              Build Networks, <br />
              Earn Commissions.
            </p>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div
        className={`flex-1 h-full flex justify-center overflow-y-auto px-4 ${
          centered ? "items-center py-8" : "pt-20 pb-8"
        }`}
      >
        <div className="inner max-w-87 sm:max-w-96 w-full flex flex-col gap-1 my-auto">
          <p className="text-[22px] font-medium tracking-tight text-secondary">
            {title}
          </p>
          <p className="text-secondary/50 font-medium mb-3">{subtitle}</p>

          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
