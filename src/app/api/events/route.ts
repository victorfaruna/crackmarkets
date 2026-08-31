import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { events } from "@/src/lib/db/schema/events";
import { and, eq, gte, lte, desc, asc, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const includePast = searchParams.get("include_past") === "true";
    const month = searchParams.get("month"); // e.g. "2026-09"
    const date = searchParams.get("date"); // e.g. "2026-09-15" (specific day)

    const conditions: SQL[] = [];

    // Category filter
    if (category && category !== "ALL") {
      conditions.push(eq(events.category, category.toUpperCase()));
    }

    // Status filter
    if (status && status !== "ALL") {
      conditions.push(eq(events.status, status.toUpperCase()));
    }

    // Specific day filter
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      conditions.push(gte(events.startsAt, startOfDay));
      conditions.push(lte(events.startsAt, endOfDay));
    } else if (month) {
      // Month range filter (e.g. 2026-09)
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10) - 1; // 0-indexed
      const startOfMonth = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, monthNum + 1, 0, 23, 59, 59));
      conditions.push(gte(events.startsAt, startOfMonth));
      conditions.push(lte(events.startsAt, endOfMonth));
    } else if (!includePast) {
      // By default if no specific date/month selected and includePast is false, show today onwards or non-completed
      const now = new Date();
      // Include events starting from beginning of today or status UPCOMING/LIVE
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      conditions.push(gte(events.startsAt, startOfToday));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: events.id,
        title: events.title,
        category: events.category,
        description: events.description,
        reward_pool: events.rewardPool,
        location: events.location,
        starts_at: events.startsAt,
        ends_at: events.endsAt,
        status: events.status,
        created_at: events.createdAt,
        updated_at: events.updatedAt,
      })
      .from(events)
      .where(whereClause)
      .orderBy(asc(events.startsAt));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: data.length,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching events.",
      },
      { status: 500 },
    );
  }
}
