import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, passwordResetTokens, auditLogs } from "@/src/lib/db/schema";
import { forgotPasswordSchema } from "@/src/lib/auth/validation";
import { generateRandomToken, hashToken } from "@/src/lib/auth/jwt";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/src/lib/security/rateLimit";
import { getRequestMetadata } from "@/src/lib/security/request";
import { verifyTurnstile } from "@/src/lib/security/turnstile";
import { sendPasswordResetEmail } from "@/src/lib/services/email.server";

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getRequestMetadata(request);
    const rateLimit = await checkRateLimit({
      namespace: "auth:forgot-password",
      identifier: ipAddress,
      limit: 5,
      windowSeconds: 15 * 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

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

    const { email, turnstile_token } = validationResult.data;
    if (!(await verifyTurnstile(turnstile_token, ipAddress))) {
      return NextResponse.json(
        { success: false, message: "Bot verification failed. Please try again." },
        { status: 400 },
      );
    }
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
        ipAddress,
        userAgent,
      });
      const emailSent = await sendPasswordResetEmail(
        normalizedEmail,
        rawResetToken,
      );
      if (!emailSent) {
        console.error("[PASSWORD_RESET_EMAIL_DELIVERY_FAILED]", {
          userId: user.id,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with that email exists, we have sent instructions to reset your password.",
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
