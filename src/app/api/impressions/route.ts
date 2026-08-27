import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { referralImpressions, referralNodes } from "@/src/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

let tableEnsured = false;
async function ensureImpressionsTable() {
  if (tableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS referral_impressions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_code varchar(50) NOT NULL,
        ip_address varchar(100),
        user_agent varchar(500),
        country varchar(100),
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS referral_impressions_user_idx ON referral_impressions(user_id);
      CREATE INDEX IF NOT EXISTS referral_impressions_code_idx ON referral_impressions(referral_code);
      CREATE INDEX IF NOT EXISTS referral_impressions_created_idx ON referral_impressions(created_at);
    `);
    tableEnsured = true;
  } catch (e) {
    console.debug("Could not auto-create impressions table:", e);
  }
}

export interface ImpressionsResponse {
  totalClicks: number;
  growthRate: number;
  growthLabel: string;
  conversionRate: number;
  totalMembers: number;
  sparkline: Array<{ v: number; date?: string }>;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthenticated",
        },
        { status: 401 },
      );
    }

    await ensureImpressionsTable();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Total all-time impressions for this user
    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralImpressions)
      .where(eq(referralImpressions.userId, session.userId));

    const totalClicks = totalCountResult?.count ?? 0;

    // 2. Past 7 days clicks vs previous 7 days clicks for real growth rate
    const [recent7Days] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralImpressions)
      .where(
        and(
          eq(referralImpressions.userId, session.userId),
          gte(referralImpressions.createdAt, sevenDaysAgo),
        ),
      );

    const [prev7Days] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralImpressions)
      .where(
        and(
          eq(referralImpressions.userId, session.userId),
          gte(referralImpressions.createdAt, fourteenDaysAgo),
          lte(referralImpressions.createdAt, sevenDaysAgo),
        ),
      );

    const countRecent = recent7Days?.count ?? 0;
    const countPrev = prev7Days?.count ?? 0;

    let growthRate = 0;
    if (countPrev > 0) {
      growthRate = Math.round(((countRecent - countPrev) / countPrev) * 1000) / 10;
    } else if (countRecent > 0) {
      growthRate = 100;
    }

    const growthLabel =
      growthRate > 0
        ? `+${growthRate}% growth`
        : growthRate < 0
        ? `${growthRate}% this week`
        : countRecent > 0
        ? "+0% this week"
        : "Active";

    // 3. Count total direct & network referrals for conversion rate
    const [memberCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralNodes)
      .where(eq(referralNodes.ancestorId, session.userId));

    const totalMembers = memberCountResult?.count ?? 0;
    const conversionRate =
      totalClicks > 0
        ? Math.round((totalMembers / totalClicks) * 1000) / 10
        : 0;

    // 4. Build 30-day sparkline bins from real impression timeline
    const dailyRows = await db
      .select({
        day: sql<string>`to_char(${referralImpressions.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(referralImpressions)
      .where(
        and(
          eq(referralImpressions.userId, session.userId),
          gte(referralImpressions.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`to_char(${referralImpressions.createdAt}, 'YYYY-MM-DD')`);

    const dailyMap = new Map<string, number>();
    dailyRows.forEach((r) => dailyMap.set(r.day, r.count));

    // Construct contiguous array of 30 days
    const sparkline: Array<{ v: number; date?: string }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      const count = dailyMap.get(key) || 0;
      sparkline.push({
        v: count,
        date: key,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          totalClicks,
          growthRate,
          growthLabel,
          conversionRate,
          totalMembers,
          sparkline,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching impressions stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load impressions.",
      },
      { status: 500 },
    );
  }
}
