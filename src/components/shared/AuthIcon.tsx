import { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  person: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
  network: <><circle cx="9" cy="8" r="3" /><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 5a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 4v3" /></>,
  chart: <><path d="M4 20v-5m5 5V11m5 9V7m5 13V3" strokeWidth="3" /></>,
  copy: <><rect x="3" y="7" width="14" height="14" rx="2" /><path d="M8 7V3h13v13h-4m-10-1 3 3 4-6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6h14M5 18h14" /></>,
  shield: <><path d="m12 2 9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6l9-4Z" /><path d="m8 12 3 3 5-6" /></>,
  learn: <><path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6l6 3 6-3v-6m4-3v9" /></>,
};

export default function AuthIcon({ name, className = "size-5" }: { name: keyof typeof paths; className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
