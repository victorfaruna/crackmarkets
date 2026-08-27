"use client";

const MonthlyBudgetCard = () => {
  const spent = 7458.78;
  const limit = 9500;
  const pct = (spent / limit) * 100;

  return (
    <div className="w-full rounded-3xl bg-primary p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-secondary font-medium text-sm">Monthly Budget Limit</p>
        <button className="text-subtext hover:text-secondary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-2.5 rounded-full bg-background overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #9b87f5, #7AE25A)",
            }}
          />
        </div>
        <div className="flex justify-between">
          <p className="text-secondary text-xs font-rubik">
            ${spent.toLocaleString()} <span className="text-subtext font-satoshi font-normal">Spend out of</span>
          </p>
          <p className="text-secondary text-xs font-rubik">
            ${limit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBudgetCard;
