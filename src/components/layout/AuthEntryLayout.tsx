"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import DashboardBrand from "./DashboardBrand";
import AuthIcon from "../shared/AuthIcon";

const features = [
  {
    icon: "network",
    title: "Grow Your Network",
    description: "Build and follow your connected referral community.",
  },
  {
    icon: "chart",
    title: "Track Your Progress",
    description: "Keep your commissions and milestones in view.",
  },
] as const;

export default function AuthEntryLayout({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: ReactNode;
}) {
  const isRegister = mode === "register";

  return (
    <main className="w-full auth-entry min-h-dvh bg-shell-background lg:flex">
      <section
        className="relative isolate flex min-h-96 overflow-hidden text-on-dark lg:min-h-dvh lg:min-w-0 lg:flex-1"
        aria-label="Welcome to Trackmarkets"
      >
        <Image
          src="/images/auth-trading-hero.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="-z-30 object-cover object-right"
        />
        <div className="absolute inset-0 -z-20 bg-linear-to-r from-shell-background via-shell-background/45 to-shell-background/5" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-shell-background/85 via-transparent to-shell-background/25" />

        <div className="flex w-full flex-col px-6 py-7 sm:px-10 lg:px-14 lg:py-10 xl:px-18">
          <Link href="/" className="mx-auto" aria-label="Trackmarkets home">
            <DashboardBrand size={56} />
          </Link>

          <div className="my-auto max-w-xl py-14 lg:py-10">
            <p className="mb-5 text-[10px] tracking-[0.4em] text-on-dark/55">
              TRADE · COPY · GROW
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-[3.5rem]">
              Trade Smarter.
              <br />
              <span className="text-shell-accent">Grow</span> Further.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-on-dark/80 sm:text-base">
              Connect your broker, grow your network, and keep your trading
              journey in one place.
            </p>

            <ul className="mt-10 hidden max-w-lg gap-7 sm:flex">
              {features.map(({ icon, title, description }) => (
                <li
                  key={title}
                  className="flex min-w-0 flex-1 items-start gap-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-shell-accent/35 bg-shell-background/55 text-shell-accent">
                    <AuthIcon name={icon} className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-on-dark/65">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden text-xs tracking-wide text-on-dark/55 lg:block">
            Your next chapter starts here.
          </p>
        </div>
      </section>

      <section
        className="min-h-dvh overflow-y-auto bg-background px-6 py-8 text-secondary sm:px-10 lg:w-[35%] lg:min-w-100 lg:max-w-125 lg:px-10"
        aria-label={
          isRegister ? "Create your account" : "Sign in to your account"
        }
      >
        <div className="mx-auto flex min-h-full w-full max-w-105 flex-col justify-center py-2">
          <nav
            aria-label="Account access"
            className="mb-8 flex text-center text-sm font-medium"
          >
            <Link
              href="/login"
              aria-current={!isRegister ? "page" : undefined}
              className={`flex-1 border-b-2 py-3 transition-colors ${
                !isRegister
                  ? "border-auth-action text-secondary"
                  : "border-secondary/10 text-secondary/50 hover:text-secondary"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              aria-current={isRegister ? "page" : undefined}
              className={`flex-1 border-b-2 py-3 transition-colors ${
                isRegister
                  ? "border-auth-action text-secondary"
                  : "border-secondary/10 text-secondary/50 hover:text-secondary"
              }`}
            >
              Register
            </Link>
          </nav>

          <div>
            <h2 className="text-[22px] tracking-tighter text-secondary">
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mb-6 mt-1 text-sm text-secondary/50">
              {isRegister ? (
                <>
                  TrackMarkets operates with full transparency. We do not accept
                  funds or subscription fees.
                  <span className="mt-2 block">
                    Sign up on TrackMarkets, use our broker sign-up link, deposit
                    funds into your broker account, then return to our website
                    and follow FoxAlgo.
                  </span>
                </>
              ) : (
                "Sign in to continue your trading journey."
              )}
            </p>

            {children}

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-secondary/50">
              <AuthIcon name="lock" className="size-3.5 shrink-0" />
              Secure access to your Trackmarkets account.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
