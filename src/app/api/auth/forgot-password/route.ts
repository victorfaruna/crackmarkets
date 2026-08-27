import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, passwordResetTokens, auditLogs } from "@/src/lib/db/schema";
import { forgotPasswordSchema } from "@/src/lib/auth/validation";
import { generateRandomToken, hashToken } from "@/src/lib/auth/jwt";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let rawResetToken: string | undefined;

    if (user) {
      rawResetToken = generateRandomToken(32);
      const hashedToken = hashToken(rawResetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: hashedToken,
        expiresAt,
      });

      await db.insert(auditLogs).values({
        userId: user.id,
        action: "PASSWORD_RESET_REQUEST",
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with that email exists, we have sent instructions to reset your password.",
        ...(process.env.NODE_ENV !== "production" && rawResetToken
          ? { debugResetToken: rawResetToken }
          : {}),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}
