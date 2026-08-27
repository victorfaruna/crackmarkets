import { create } from "zustand";

/* ─── Form data shape ──────────────────────────────────────────────────────── */

export interface OnboardFormData {
  /** Step 1 – OrganizationSetup */
  orgName: string;
  orgHandle: string;

  /** Step 2 – TeamInvite */
  emails: string[];

  /** Step 3 – PayrollConfig */
  payFrequency: string;
  primaryCurrencyId: string;
}

/* ─── Store shape ──────────────────────────────────────────────────────────── */

export interface OnboardState {
  /** Current step index (0-based) */
  step: number;
  /** Total number of onboard stages */
  totalSteps: number;
  /** Persisted form values across all steps */
  formData: OnboardFormData;

  /** Navigate to the next step */
  next: () => void;
  /** Navigate to the previous step */
  back: () => void;
  /** Jump to a specific step */
  goTo: (step: number) => void;
  /** Partially update form data */
  setFormData: (partial: Partial<OnboardFormData>) => void;
  /** Reset back to step 0 and clear form data */
  reset: () => void;
}

export const TOTAL_ONBOARD_STEPS = 6;

const initialFormData: OnboardFormData = {
  orgName: "",
  orgHandle: "",
  emails: [],
  payFrequency: "monthly",
  primaryCurrencyId: "5fa411fd-4afb-486e-bdf6-8fafef57fd0f",
};

export const useOnboardStore = create<OnboardState>()((set) => ({
  step: 0,
  totalSteps: TOTAL_ONBOARD_STEPS,
  formData: initialFormData,

  next: () =>
    set((state) => ({
      step: Math.min(state.step + 1, state.totalSteps - 1),
    })),

  back: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 0),
    })),

  goTo: (step) =>
    set((state) => ({
      step: Math.max(0, Math.min(step, state.totalSteps - 1)),
    })),

  setFormData: (partial) =>
    set((state) => ({
      formData: { ...state.formData, ...partial },
    })),

  reset: () => set({ step: 0, formData: initialFormData }),
}));
