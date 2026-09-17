import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useOnboardStore } from "../stores/onboardStore";
import {
  createOrg,
  inviteTeamMembers,
  setPayrollPreferences,
} from "../services/org";
import { onboardKeys } from "../keys/onboard.keys";

/* ─── Stage definitions ────────────────────────────────────────────────────── */

export type OnboardStage =
  | "idle"
  | "creating-org"
  | "inviting-team"
  | "setting-payroll"
  | "complete"
  | "error";

export interface StageInfo {
  key: OnboardStage;
  label: string;
  description: string;
}

export const ONBOARD_STAGES: StageInfo[] = [
  {
    key: "creating-org",
    label: "Creating Organization",
    description: "Setting up your workspace…",
  },
  {
    key: "inviting-team",
    label: "Inviting Team",
    description: "Sending invites to your teammates…",
  },
  {
    key: "setting-payroll",
    label: "Configuring Payroll",
    description: "Applying your payroll preferences…",
  },
];

/* ─── Hook ─────────────────────────────────────────────────────────────────── */

export const useOnboardSetup = () => {
  const { formData, goTo } = useOnboardStore();
  const [stage, setStage] = useState<OnboardStage>("idle");
  const [error, setError] = useState<string | null>(null);

  /* ── Individual mutations ─────────────────────────────────────────────── */

  const orgMutation = useMutation({
    mutationKey: [...onboardKeys.SETUP_ORG],
    mutationFn: () =>
      createOrg({ name: formData.orgName, slug: formData.orgHandle }),
  });

  const teamMutation = useMutation({
    mutationKey: [...onboardKeys.SETUP_TEAM],
    mutationFn: (orgId: string) =>
      inviteTeamMembers(orgId, {
        invitees: formData.emails.map((email) => ({
          email,
        })),
      }),
  });

  const payrollMutation = useMutation({
    mutationKey: [...onboardKeys.SETUP_PAYROLL],
    mutationFn: (orgId: string) =>
      setPayrollPreferences(orgId, {
        payFrequency: formData.payFrequency,
        primaryCurrencyId: formData.primaryCurrencyId,
      }),
    onError: (error) => console.log(error),
  });

  /* ── Sequential runner ───────────────────────────────────────────────── */

  const run = useCallback(async () => {
    setError(null);

    try {
      // 1 → Create organisation
      setStage("creating-org");
      const orgResult = await orgMutation.mutateAsync();
      const orgId: string = orgResult?.data?.id ?? orgResult?.id;

      // 2 → Invite team members (skip if no emails)
      setStage("inviting-team");
      if (formData.emails.length > 0) {
        await teamMutation.mutateAsync(orgId);
      }

      // 3 → Set payroll preferences
      setStage("setting-payroll");
      await payrollMutation.mutateAsync(orgId);

      // All done → jump to Complete step
      setStage("complete");
      goTo(5); // Complete step index
    } catch (err: unknown) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Something went wrong during setup. Please try again.");
    }
  }, [formData, orgMutation, teamMutation, payrollMutation, goTo]);

  /* ── Derived state ───────────────────────────────────────────────────── */

  const currentStageInfo = ONBOARD_STAGES.find((s) => s.key === stage) ?? null;

  const isRunning =
    stage === "creating-org" ||
    stage === "inviting-team" ||
    stage === "setting-payroll";

  return {
    stage,
    currentStageInfo,
    isRunning,
    error,
    run,
  };
};
