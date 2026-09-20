import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAdminFromRequest } from "@/src/lib/auth/admin";
import { db } from "@/src/lib/db";
import { auditLogs, users } from "@/src/lib/db/schema";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Administrator access required." },
        { status: 401 },
      );
    }

    const parsedId = z.string().uuid().safeParse((await params).id);
    if (!parsedId.success) {
      return NextResponse.json(
        { success: false, message: "Invalid user." },
        { status: 400 },
      );
    }

    const [target] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        roboforexLinked: users.roboforexLinked,
        roboforexId: users.roboforexId,
      })
      .from(users)
      .where(eq(users.id, parsedId.data))
      .limit(1);
    if (!target) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Administrator accounts cannot be changed here." },
        { status: 403 },
      );
    }

    const { ipAddress, userAgent } = getRequestMetadata(request);
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          roboforexLinked: false,
          roboforexId: null,
          fundingStatus: "LOCKED",
          updatedAt: new Date(),
        })
        .where(eq(users.id, target.id));

      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: "ADMIN_UNLINK_BROKER",
        ipAddress,
        userAgent,
        details: {
          targetUserId: target.id,
          targetEmail: target.email,
          previousBrokerId: target.roboforexId,
          wasLinked: target.roboforexLinked,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: target.roboforexLinked
        ? "Broker account unlinked and funding locked."
        : "Broker account was already unlinked.",
      data: { roboforex_linked: false, funding_status: "LOCKED" },
    });
  } catch (error) {
    console.error("Admin broker unlink error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to unlink the broker account." },
      { status: 500 },
    );
  }
}
