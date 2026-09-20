import { z } from "zod";

export const adminLoginSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(100),
    turnstile_token: z.string().min(1).max(4096).optional(),
  })
  .strict();

export const adminUserUpdateSchema = z
  .object({
    role: z.enum(["USER", "SUPPORT"]).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    kyc_status: z
      .enum(["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"])
      .optional(),
    funding_status: z.enum(["LOCKED", "UNLOCKED"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one account field is required.",
  });

export const adminWithdrawalActionSchema = z
  .object({
    status: z.literal("REVERSED"),
    reason: z.string().trim().min(3).max(500),
  })
  .strict();
