export default function DashboardSearch({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Search"
      className={`flex h-10 items-center gap-3 rounded-xl border px-3.5 text-sm transition-colors ${
        compact
          ? "w-58 border-secondary/10 bg-background text-secondary/50 hover:border-secondary/20"
          : "w-full border-on-dark/10 bg-on-dark/5 text-on-dark/60 shadow-inner shadow-on-dark/5 hover:bg-on-dark/10"
      }`}
    >
      <svg
        aria-hidden="true"
        className="size-4.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="10.75" cy="10.75" r="6.75" />
        <path strokeLinecap="round" d="m16 16 4.5 4.5" />
      </svg>
      <span className="min-w-0 flex-1 truncate text-left">
        {compact ? "Search" : "Search markets, assets, or help..."}
      </span>
      <kbd
        className={`kbd kbd-sm shrink-0 rounded border-0 font-inter ${compact ? "bg-primary text-secondary/50" : "bg-on-dark/10 text-on-dark/70"}`}
      >
        ⌘ K
      </kbd>
    </button>
  );
}
