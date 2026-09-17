import { z } from "zod";

const turnstileToken = z.string().min(1).max(4096).optional();

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long"),
  phone_number: z
    .string()
    .min(5, "Phone number is too short")
    .max(50, "Phone number is too long"),
  country: z.string().min(1, "Country is required"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(100, "Password is too long"),
  referral_code: z.string().max(50).optional().nullable(),
  turnstile_token: turnstileToken,
}).strict();

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  turnstile_token: turnstileToken,
}).strict();

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstile_token: turnstileToken,
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(100, "Password is too long"),
}).strict();

export const profileUpdateSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
    phone_number: z.string().trim().min(5).max(50).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    telegram_handle: z.string().trim().max(100).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "No update fields provided");

export const linkRoboForexSchema = z
  .object({
    roboforex_id: z.string().trim().min(4).max(50).regex(/^[A-Za-z0-9_-]+$/),
  })
  .strict();

export const withdrawalSchema = z
  .object({
    amount: z.coerce.number().positive().finite().multipleOf(0.0001),
    address: z.string().trim().min(16).max(255),
    network: z.enum(["TRC20", "BEP20", "ERC20", "SOL"]),
  })
  .strict()
  .superRefine(({ address, network }, context) => {
    const isValid =
      network === "TRC20"
        ? /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
        : network === "ERC20" || network === "BEP20"
          ? /^0x[a-fA-F0-9]{40}$/.test(address)
          : /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    if (!isValid) {
      context.addIssue({
        code: "custom",
        path: ["address"],
        message: `Invalid ${network} wallet address`,
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
