import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import {
  users,
  passwordResetTokens,
  refreshTokens,
  auditLogs,
} from "@/src/lib/db/schema";
import { resetPasswordSchema } from "@/src/lib/auth/validation";
import { hashPassword } from "@/src/lib/auth/password";
import { hashToken } from "@/src/lib/auth/jwt";
import { eq, and, isNull, gt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token, password } = validationResult.data;
    const hashedToken = hashToken(token);
    const now = new Date();

    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hashedToken),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Password reset link is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    const newPasswordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      // 1. Update user password
      await tx
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: now,
        })
        .where(eq(users.id, tokenRecord.userId));

      // 2. Mark token as used
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      // 3. Invalidate all active refresh tokens for security
      await tx
        .update(refreshTokens)
        .set({ revokedAt: now })
        .where(
          and(
            eq(refreshTokens.userId, tokenRecord.userId),
            isNull(refreshTokens.revokedAt),
          ),
        );

      // 4. Audit log
      await tx.insert(auditLogs).values({
        userId: tokenRecord.userId,
        action: "PASSWORD_RESET_COMPLETE",
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your password has been successfully reset. You may now log in.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during password reset.",
      },
      { status: 500 },
    );
  }
}
