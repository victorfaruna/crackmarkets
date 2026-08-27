import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, referralImpressions } from "@/src/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

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

const TrackSchema = z.object({
  referralCode: z.string().min(1).max(50),
  country: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureImpressionsTable();

    const body = await request.json();
    const parsed = TrackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }

    const { referralCode, country } = parsed.data;

    // Find the user owning this referral code
    const [referrer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, referralCode))
      .limit(1);

    if (!referrer) {
      return NextResponse.json(
        { success: false, message: "Referrer not found" },
        { status: 404 },
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.insert(referralImpressions).values({
      userId: referrer.id,
      referralCode,
      ipAddress,
      userAgent,
      country: country || null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error tracking referral impression:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record impression" },
      { status: 500 },
    );
  }
}
