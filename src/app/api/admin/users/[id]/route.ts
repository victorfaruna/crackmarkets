import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { auditLogs, refreshTokens, users } from "@/src/lib/db/schema";
import { getAdminFromRequest } from "@/src/lib/auth/admin";
import { adminUserUpdateSchema } from "@/src/lib/auth/admin-validation";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function PATCH(
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
    const parsedBody = adminUserUpdateSchema.safeParse(await request.json());
    if (!parsedId.success || !parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "Invalid account update." },
        { status: 400 },
      );
    }

    const [target] = await db
      .select()
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

    const nextKycStatus = parsedBody.data.kyc_status ?? target.kycStatus;
    if (
      parsedBody.data.funding_status === "UNLOCKED" &&
      nextKycStatus !== "APPROVED"
    ) {
      return NextResponse.json(
        { success: false, message: "Funding can only be unlocked after KYC approval." },
        { status: 409 },
      );
    }

    const shouldLockFunding =
      parsedBody.data.kyc_status !== undefined && nextKycStatus !== "APPROVED";
    const update = {
      ...(parsedBody.data.role ? { role: parsedBody.data.role } : {}),
      ...(parsedBody.data.status ? { status: parsedBody.data.status } : {}),
      ...(parsedBody.data.kyc_status
        ? { kycStatus: parsedBody.data.kyc_status }
        : {}),
      ...(shouldLockFunding
        ? { fundingStatus: "LOCKED" }
        : parsedBody.data.funding_status
        ? { fundingStatus: parsedBody.data.funding_status }
        : {}),
      updatedAt: new Date(),
    };
    const { ipAddress, userAgent } = getRequestMetadata(request);

    const updated = await db.transaction(async (tx) => {
      const [record] = await tx
        .update(users)
        .set(update)
        .where(eq(users.id, target.id))
        .returning({
          id: users.id,
          role: users.role,
          status: users.status,
          kyc_status: users.kycStatus,
          funding_status: users.fundingStatus,
          updated_at: users.updatedAt,
        });

      if (parsedBody.data.status === "SUSPENDED") {
        await tx
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(refreshTokens.userId, target.id),
              isNull(refreshTokens.revokedAt),
            ),
          );
      }

      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: "ADMIN_USER_UPDATE",
        ipAddress,
        userAgent,
        details: {
          targetUserId: target.id,
          before: {
            role: target.role,
            status: target.status,
            kyc_status: target.kycStatus,
            funding_status: target.fundingStatus,
          },
          after: {
            ...parsedBody.data,
            ...(shouldLockFunding ? { funding_status: "LOCKED" } : {}),
          },
        },
      });
      return record;
    });

    return NextResponse.json({
      success: true,
      message: "Account updated.",
      data: updated,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update the account." },
      { status: 500 },
    );
  }
}
