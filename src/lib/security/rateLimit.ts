import { sql } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { anonymizeRateLimitKey } from "./request";

interface RateLimitOptions {
  namespace: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}

interface RateLimitRow extends Record<string, unknown> {
  count: number;
  reset_at: Date;
}

export async function checkRateLimit({
  namespace,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions) {
  const key = `${namespace}:${anonymizeRateLimitKey(identifier)}`;
  const result = await db.execute<RateLimitRow>(sql`
    INSERT INTO api_rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + (${windowSeconds} * interval '1 second'))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN api_rate_limits.reset_at <= now() THEN 1
        ELSE api_rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN api_rate_limits.reset_at <= now()
          THEN now() + (${windowSeconds} * interval '1 second')
        ELSE api_rate_limits.reset_at
      END
    RETURNING count, reset_at
  `);

  const row = result[0];
  return {
    allowed: Boolean(row) && Number(row.count) <= limit,
    remaining: row ? Math.max(0, limit - Number(row.count)) : 0,
    resetAt: row ? new Date(row.reset_at) : new Date(),
  };
}
