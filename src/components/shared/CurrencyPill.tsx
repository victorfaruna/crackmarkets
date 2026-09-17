import React from "react";

interface CurrencyPillProps {
  currencyUrl?: string;
  currencyName?: string;
  fiatCurrencyUrl?: string;
}

export default function CurrencyPill({
  currencyName = "USDT",
}: CurrencyPillProps) {
  return (
    <div className="w-fit self-start flex relative items-center gap-1.5 rounded-full bg-background py-1 px-1.5 pr-3 border border-secondary/10 shadow-2xs">
      {/* Overlapping pair: USDT / USD token + US Flag badge */}
      <div className="flex items-center -space-x-1.5">
        {/* Token / USD Logo */}
        <div className="size-4.5 rounded-full shrink-0 z-2 ring-1 ring-background overflow-hidden flex items-center justify-center bg-success">
          {currencyName === "USD" ? (
            <svg
              viewBox="0 0 32 32"
              className="size-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="16" fill="var(--success)" />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--background)"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="18"
                fontWeight="bold"
              >
                $
              </text>
            </svg>
          ) : (
            <svg
              viewBox="0 0 2000 2000"
              className="size-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="var(--success)"
                d="M1000 0c552.28 0 1000 447.72 1000 1000s-447.72 1000-1000 1000S0 1552.28 0 1000 447.72 0 1000 0z"
              />
              <path
                fill="var(--background)"
                d="M1237.7 758.9v108.6c0 1.9-1.5 3.4-3.4 3.4h-172.9v118.8c187.3 8.8 327.9 44.5 327.9 87.7 0 43.1-140.6 78.8-327.9 87.7v359.8c0 1.9-1.5 3.4-3.4 3.4h-117.8c-1.9 0-3.4-1.5-3.4-3.4v-359.8c-187.3-8.8-327.9-44.5-327.9-87.7 0-43.1 140.6-78.8 327.9-87.7V870.9H668.9c-1.9 0-3.4-1.5-3.4-3.4V758.9c0-1.9 1.5-3.4 3.4-3.4h565.4c1.9 0 3.4 1.5 3.4 3.4zm-297.5 378.9c-164.7 0-299.7-25.7-313.1-58.4 13.4-32.7 148.4-58.4 313.1-58.4s299.7 25.7 313.1 58.4c-13.4 32.7-148.4 58.4-313.1 58.4z"
              />
            </svg>
          )}
        </div>

        {/* Real US Flag Badge */}
        <div className="size-4.5 rounded-full shrink-0 z-1 overflow-hidden ring-1 ring-background flex items-center justify-center">
          <svg
            viewBox="0 0 512 512"
            className="size-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <clipPath id="usFlagClipInline">
              <circle cx="256" cy="256" r="256" />
            </clipPath>
            <g clipPath="url(#usFlagClipInline)">
              <path fill="var(--primary)" d="M0 0h512v512H0z" />
              <path
                fill="var(--error)"
                d="M0 0h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.7h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512V512H0z"
              />
              <path fill="var(--accent)" d="M0 0h256v275.7H0z" />
              <g fill="var(--background)">
                <circle cx="35" cy="35" r="7" />
                <circle cx="95" cy="35" r="7" />
                <circle cx="155" cy="35" r="7" />
                <circle cx="215" cy="35" r="7" />
                <circle cx="65" cy="70" r="7" />
                <circle cx="125" cy="70" r="7" />
                <circle cx="185" cy="70" r="7" />
                <circle cx="35" cy="105" r="7" />
                <circle cx="95" cy="105" r="7" />
                <circle cx="155" cy="105" r="7" />
                <circle cx="215" cy="105" r="7" />
                <circle cx="65" cy="140" r="7" />
                <circle cx="125" cy="140" r="7" />
                <circle cx="185" cy="140" r="7" />
                <circle cx="35" cy="175" r="7" />
                <circle cx="95" cy="175" r="7" />
                <circle cx="155" cy="175" r="7" />
                <circle cx="215" cy="175" r="7" />
                <circle cx="65" cy="210" r="7" />
                <circle cx="125" cy="210" r="7" />
                <circle cx="185" cy="210" r="7" />
                <circle cx="35" cy="245" r="7" />
                <circle cx="95" cy="245" r="7" />
                <circle cx="155" cy="245" r="7" />
                <circle cx="215" cy="245" r="7" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      <p className="text-[0.7rem] font-semibold text-secondary/80 font-mono tracking-tight">
        {currencyName}
      </p>
    </div>
  );
}
