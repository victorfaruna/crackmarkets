import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getAdminFromRequest } from "@/src/lib/auth/admin";
import { db } from "@/src/lib/db";
import { auditLogs, refreshTokens, users } from "@/src/lib/db/schema";
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
      .select({ id: users.id, role: users.role, email: users.email })
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
        { success: false, message: "Administrator sessions cannot be revoked here." },
        { status: 403 },
      );
    }

    const { ipAddress, userAgent } = getRequestMetadata(request);
    const revoked = await db.transaction(async (tx) => {
      const records = await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.userId, target.id),
            isNull(refreshTokens.revokedAt),
          ),
        )
        .returning({ id: refreshTokens.id });

      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: "ADMIN_REVOKE_USER_SESSIONS",
        ipAddress,
        userAgent,
        details: {
          targetUserId: target.id,
          targetEmail: target.email,
          revokedSessions: records.length,
        },
      });
      return records.length;
    });

    return NextResponse.json({
      success: true,
      message: revoked
        ? `${revoked} active session${revoked === 1 ? "" : "s"} revoked.`
        : "No active sessions were found.",
    });
  } catch (error) {
    console.error("Admin session revocation error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to revoke sessions." },
      { status: 500 },
    );
  }
}
