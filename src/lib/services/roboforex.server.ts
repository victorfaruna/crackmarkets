import { z } from "zod";

const brokerVerificationResponseSchema = z
  .object({
    verified: z.boolean(),
    account_id: z.string().min(1),
  })
  .strict();

export async function verifyRoboForexAccount(
  accountId: string,
): Promise<boolean> {
  const endpoint = process.env.ROBOFOREX_ACCOUNT_VERIFY_URL;
  const apiKey = process.env.ROBOFOREX_API_KEY;
  if (!endpoint || !apiKey) return false;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account_id: accountId }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const parsed = brokerVerificationResponseSchema.safeParse(
      await response.json(),
    );
    return (
      parsed.success &&
      parsed.data.verified &&
      parsed.data.account_id === accountId
    );
  } catch {
    return false;
  }
}
