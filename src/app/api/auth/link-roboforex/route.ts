import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { auditLogs, users } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { linkRoboForexSchema } from "@/src/lib/auth/validation";
import { verifyRoboForexAccount } from "@/src/lib/services/roboforex.server";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const parsed = linkRoboForexSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "A valid RoboForex ID is required." },
        { status: 400 },
      );
    }
    const roboforexId = parsed.data.roboforex_id;

    // Check current state first
    const [user] = await db
      .select({
        roboforexLinked: users.roboforexLinked,
        status: users.status,
        kycStatus: users.kycStatus,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    if (user.roboforexLinked) {
      return NextResponse.json(
        { success: true, message: "RoboForex account is already linked." },
        { status: 200 },
      );
    }

    if (user.status !== "ACTIVE" || user.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Email verification and approved KYC are required." },
        { status: 403 },
      );
    }

    if (!(await verifyRoboForexAccount(roboforexId))) {
      return NextResponse.json(
        { success: false, message: "Unable to verify that RoboForex account." },
        { status: 422 },
      );
    }

    // Mark as linked with their broker ID
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          roboforexLinked: true,
          roboforexId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));
      await tx.insert(auditLogs).values({
        userId: session.userId,
        action: "ROBOFOREX_LINK",
        ipAddress,
        userAgent,
        details: { roboforexId },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "RoboForex account linked successfully.",
        data: { roboforex_id: roboforexId },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error linking RoboForex account:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
