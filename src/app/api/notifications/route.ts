import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { notifications } from "@/src/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const updateNotificationSchema = z
  .object({
    notificationId: z.string().uuid().optional(),
    markAll: z.boolean().optional(),
  })
  .strict();

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    // Fetch user's notifications
    let rows = await db
      .select({
        id: notifications.id,
        category: notifications.category,
        title: notifications.title,
        message: notifications.message,
        actionUrl: notifications.actionUrl,
        actionLabel: notifications.actionLabel,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, session.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    // If user has 0 notifications, seed initial account notifications
    if (rows.length === 0) {
      const initialSeeds = [
        {
          userId: session.userId,
          category: "COMMISSIONS" as const,
          title: "Commission Balance Active",
          message:
            "Your multi-tier referral and lot commission ledger is synchronized and active.",
          actionUrl: "/dashboard",
          actionLabel: "View Overview",
          isRead: false,
        },
        {
          userId: session.userId,
          category: "NETWORK" as const,
          title: "10-Level Lineage Generated",
          message:
            "Your unique referral link is live. Share your link to start earning multi-tier bonuses.",
          actionUrl: "/dashboard/network",
          actionLabel: "View Network",
          isRead: false,
        },
        {
          userId: session.userId,
          category: "SECURITY" as const,
          title: "Account Security & Verification",
          message:
            "Complete your KYC verification and link your broker account to unlock trading capital.",
          actionUrl: "/dashboard/kyc",
          actionLabel: "Complete KYC",
          isRead: true,
        },
        {
          userId: session.userId,
          category: "SYSTEM" as const,
          title: "Welcome to Crack Markets",
          message:
            "Welcome to the advanced service provider platform. Explore your financial overview and integration cards.",
          actionUrl: "/dashboard",
          actionLabel: "Dashboard Overview",
          isRead: true,
        },
      ];

      await db.insert(notifications).values(initialSeeds);

      rows = await db
        .select({
          id: notifications.id,
          category: notifications.category,
          title: notifications.title,
          message: notifications.message,
          actionUrl: notifications.actionUrl,
          actionLabel: notifications.actionLabel,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(eq(notifications.userId, session.userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }

    const unreadCount = rows.filter((r) => !r.isRead).length;

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications: rows.map((r) => ({
            ...r,
            createdAt: r.createdAt
              ? new Date(r.createdAt).toISOString()
              : new Date().toISOString(),
          })),
          unreadCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API_NOTIFICATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateNotificationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error.",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { notificationId, markAll } = parseResult.data;

    if (markAll) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.userId));
    } else if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, session.userId),
          ),
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API_NOTIFICATIONS_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required." },
        { status: 400 },
      );
    }

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, session.userId),
        ),
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API_NOTIFICATIONS_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
