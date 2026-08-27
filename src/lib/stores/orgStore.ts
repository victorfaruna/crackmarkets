import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgCurrency {
  id: string;
  name: string;
  logoUrl?: string;
  fiatLogoUrl?: string;
}

export interface OrgProfile {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  totalMembers: number;
  currency: OrgCurrency;
  subscriptionTier?: string;
}

interface OrgState {
  // ── Persisted ──────────────────────────────────────────────────────────────
  /** The currently active organization; cleared when leaving */
  org: OrgProfile | null;
  setOrg: (org: OrgProfile | null) => void;
  updateOrg: (patch: Partial<OrgProfile>) => void;
  resetOrg: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      // ── Persisted state ───────────────────────────────────────────────────
      org: null,
      setOrg: (org) => set({ org }),
      updateOrg: (patch) =>
        set((state) => ({
          org: state.org ? { ...state.org, ...patch } : null,
        })),
      resetOrg: () =>
        set({
          org: null,
        }),
    }),
    {
      name: "chainroll-org",
    },
  ),
);
