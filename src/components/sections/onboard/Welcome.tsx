"use client";

import Logo from "@/src/components/shared/Logo";
import { useOnboardStore } from "@/src/lib/stores/onboardStore";

const Welcome = () => {
  const { next, formData } = useOnboardStore();
  return (
    <div className="flex flex-col gap-6 items-center animate-fade-in pt-10">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-accent/20 rounded-full scale-150" />
        <Logo size={120} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-medium font-clash-displayy text-2xl text-secondary text-center leading-none">
          Welcome
        </p>
        <p className="text-secondary/50 font-medium text-center max-w-sm leading-relaxed">
          Let&apos;s get your workspace ready in a few simple steps
          <br />✦ It only takes a few seconds ✦
        </p>
      </div>

      <button
        onClick={next}
        className="rounded-full border border-subtext/90 font-semibold text-secondary px-8 py-3 whitespace-nowrap  transition-all duration-300 hover:scale-105 active:scale-95 "
      >
        Get Started
      </button>
    </div>
  );
};

export default Welcome;
