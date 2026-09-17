import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { notifications } from "@/src/lib/db/schema";

const updateNotificationSchema = z
  .object({
    notificationId: z.string().uuid().optional(),
    markAll: z.literal(true).optional(),
  })
  .strict()
  .refine((data) => Boolean(data.notificationId) !== Boolean(data.markAll));

const deleteNotificationSchema = z.object({ id: z.string().uuid() }).strict();

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const rows = await db
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

    return NextResponse.json({
      success: true,
      data: {
        notifications: rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        })),
        unreadCount: rows.filter((row) => !row.isRead).length,
      },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch notifications." },
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
    const parsed = updateNotificationSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid notification update." },
        { status: 400 },
      );
    }

    const condition = parsed.data.markAll
      ? eq(notifications.userId, session.userId)
      : and(
          eq(notifications.id, parsed.data.notificationId as string),
          eq(notifications.userId, session.userId),
        );
    await db.update(notifications).set({ isRead: true }).where(condition);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Unable to update notifications." },
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
    const parsed = deleteNotificationSchema.safeParse({
      id: request.nextUrl.searchParams.get("id"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "A valid notification ID is required." },
        { status: 400 },
      );
    }

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, parsed.data.id),
          eq(notifications.userId, session.userId),
        ),
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete notification." },
      { status: 500 },
    );
  }
}
