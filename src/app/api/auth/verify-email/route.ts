import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, emailVerificationTokens, auditLogs } from "@/src/lib/db/schema";
import { verifyEmailSchema } from "@/src/lib/auth/validation";
import { hashToken } from "@/src/lib/auth/jwt";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = verifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is required.",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token } = validationResult.data;
    const hashedToken = hashToken(token);
    const now = new Date();

    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, hashedToken),
          gt(emailVerificationTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification token.",
        },
        { status: 400 },
      );
    }

    // Activate user
    await db
      .update(users)
      .set({
        status: "ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenRecord.userId));

    // Delete used verification token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, tokenRecord.id));

    // Audit log
    await db.insert(auditLogs).values({
      userId: tokenRecord.userId,
      action: "EMAIL_VERIFY",
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully. Your account is now active.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during email verification.",
      },
      { status: 500 },
    );
  }
}
