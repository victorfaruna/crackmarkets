"use client";

const OrgVerificationCard = () => {
  return (
    <div className="w-full rounded-3xl bg-primary p-5 flex flex-col gap-3">
      {/* Icon */}
      <div className="flex items-start justify-between">
        <div className="size-10 rounded-full bg-background flex items-center justify-center text-[#9b87f5]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-secondary font-medium text-sm">
          Account Verification
        </p>
        <p className="text-subtext text-xs leading-relaxed">
          Complete your account verification to unlock secure transactions and
          full financial access.
        </p>
      </div>
      <button className="w-fit px-4 h-9 rounded-full border border-[#7AE25A] text-[#7AE25A] text-xs font-medium hover:bg-[#7AE25A]/10 transition-colors">
        Verify Account
      </button>
    </div>
  );
};

export default OrgVerificationCard;
