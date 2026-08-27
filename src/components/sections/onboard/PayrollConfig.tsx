"use client";

import { useOnboardStore } from "@/src/lib/stores/onboardStore";

const frequencies = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-weekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
];

const currencies = [
  {
    id: "5fa411fd-4afb-486e-bdf6-8fafef57fd0f",
    label: "USDC",
    symbol: "$",
    logo: "/images/stablecoins/usdc.png",
  },
  {
    id: "486a868f-6c57-42a0-a565-98c3ceb90d1e",
    label: "USDT",
    symbol: "$",
    logo: "/images/stablecoins/usdt.png",
  },
  {
    id: "91af08e6-2779-4037-a4bd-cf2eb6e4c75d",
    label: "DAI",
    symbol: "$",
    logo: "/images/stablecoins/dai.png",
  },
  {
    id: "9b1936b8-ebf0-45f4-ac4d-26b9b5a8f642",
    label: "cNGN",
    symbol: "₦",
    logo: "/images/stablecoins/cngn.png",
  },
];

const PayrollConfig = () => {
  const { next, back, formData, setFormData } = useOnboardStore();
  const selectedFrequency = formData.payFrequency;
  const selectedCurrency = formData.primaryCurrencyId;

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-md animate-fade-in">
      <div className="flex flex-col items-center gap-1">
        <p className="font-medium font-clash-displayy text-xl text-secondary text-center leading-none">
          Payroll Preferences
        </p>
        <p className="text-subtext text-center font-medium">
          Set your default payroll frequency and currency
        </p>
      </div>

      <div className="w-full flex flex-col gap-5">
        {/* Frequency */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-medium text-secondary/70">
            Pay Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                onClick={() => setFormData({ payFrequency: freq.value })}
                className={`h-12 relative rounded-xl text-sm font-medium border transition-all duration-200 ${
                  selectedFrequency === freq.value
                    ? "border-accent bg-accent/5"
                    : "border-secondary/20"
                }`}
              >
                {freq.value === selectedFrequency && (
                  <svg
                    className="size-4 text-accent absolute top-1 right-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {freq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-medium text-secondary/70">
            Primary Currency
          </label>
          <div className="grid grid-cols-4 gap-2">
            {currencies.map((cur) => (
              <button
                key={cur.label}
                onClick={() => setFormData({ primaryCurrencyId: cur.id })}
                className={`px-2 py-3 relative rounded-xl text-sm outline-1 font-medium transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                  selectedCurrency === cur.id
                    ? "outline-accent bg-accent/5"
                    : "outline-secondary/20"
                }`}
              >
                {cur.id === selectedCurrency && (
                  <svg
                    className="size-4 text-accent absolute top-1 right-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {cur.logo && (
                  <img src={cur.logo} alt={cur.label} width={20} height={20} />
                )}
                <span className="text-[10px] opacity-70">{cur.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-5 w-full max-w-md">
        <button
          onClick={next}
          className="w-fit px-10 mx-auto flex  items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-primary py-3 whitespace-nowrap transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PayrollConfig;
