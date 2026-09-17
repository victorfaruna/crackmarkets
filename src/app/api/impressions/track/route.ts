import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, referralImpressions } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkRateLimit } from "@/src/lib/security/rateLimit";
import { getRequestMetadata } from "@/src/lib/security/request";

const TrackSchema = z.object({
  referralCode: z.string().min(1).max(50),
  country: z.string().max(100).optional(),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getRequestMetadata(request);
    const rateLimit = await checkRateLimit({
      namespace: "referral:impression",
      identifier: ipAddress,
      limit: 30,
      windowSeconds: 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests" },
        { status: 429 },
      );
    }

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
