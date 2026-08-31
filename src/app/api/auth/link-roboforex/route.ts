import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const roboforexId = String(body.roboforex_id || "").trim();

    if (!roboforexId) {
      return NextResponse.json(
        { success: false, message: "RoboForex ID is required." },
        { status: 400 },
      );
    }

    // Check current state first
    const [user] = await db
      .select({ roboforexLinked: users.roboforexLinked })
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

    // Mark as linked with their broker ID
    await db
      .update(users)
      .set({
        roboforexLinked: true,
        roboforexId: roboforexId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

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
