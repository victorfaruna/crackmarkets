import { z } from "zod";

const turnstileResponseSchema = z
  .object({
    success: z.boolean(),
  })
  .passthrough();

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp: string,
): Promise<boolean> {
  if (process.env.TURNSTILE_ENABLED !== "true") {
    return true;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  if (!token) return false;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: remoteIp,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) return false;
    const parsed = turnstileResponseSchema.safeParse(await response.json());
    return parsed.success && parsed.data.success;
  } catch {
    return false;
  }
}
