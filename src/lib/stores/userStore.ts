import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  phone_number?: string;
  country?: string;
  telegram_handle?: string | null;
  telegramHandle?: string | null;
  roboforex_linked?: boolean;
  roboforex_id?: string | null;
  referral_code?: string;
  referred_by_id?: string | null;
  status?: "EMAIL_VERIFICATION_PENDING" | "ACTIVE" | "SUSPENDED" | string;
  kyc_status?: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED" | string;
  funding_status?: "LOCKED" | "UNLOCKED" | string;
  role?: "USER" | "ADMIN" | "SUPPORT" | string;
  avatarUrl?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserState {
  // ── Persisted ──────────────────────────────────────────────────────────────
  /** Hydrated from localStorage; cleared on logout */
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  resetUser: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // ── Persisted state ───────────────────────────────────────────────────
      user: null,
      setUser: (user) => {
        if (!user) {
          set({ user: null });
          return;
        }
        // Normalize firstName/lastName and first_name/last_name
        const fName = user.first_name || user.firstName || "";
        const lName = user.last_name || user.lastName || "";
        set({
          user: {
            ...user,
            first_name: fName,
            last_name: lName,
            firstName: fName,
            lastName: lName,
          },
        });
      },
      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),
      resetUser: () =>
        set({
          user: null,
        }),
    }),
    {
      name: "trackmarkets-user",
    },
  ),
);
