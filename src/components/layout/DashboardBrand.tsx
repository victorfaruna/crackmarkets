export function DashboardMark({
  className = "",
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 44"
      fill="currentColor"
      className={`shrink-0 text-shell-accent ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <path d="M2 31 10 25v17H2zm12-11 8-6v28h-8zm12-11L36 2v40H26z" />
      <path d="m1 29 11-9v5L1 34zm12-12 11-9v5l-11 9z" opacity=".55" />
    </svg>
  );
}

export default function DashboardBrand({ size = 20 }: { size?: number }) {
  return (
    <span
      className="flex items-center gap-2 whitespace-nowrap"
      aria-label="Trackmarkets"
    >
      <DashboardMark size={size} />
      <span
        aria-hidden="true"
        className="hidden font-bold tracking-tight text-on-dark sm:inline"
      >
        TRACK<span className="text-shell-accent">MARKETS</span>
      </span>
    </span>
  );
}
