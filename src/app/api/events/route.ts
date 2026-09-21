import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { events } from "@/src/lib/db/schema/events";
import { and, eq, gte, lt, or, isNull, asc, SQL, sql } from "drizzle-orm";
import { z } from "zod";

const eventQuerySchema = z
  .object({
    category: z.enum(["ALL", "TRADING_CONTEST", "WEBINAR", "LEADERSHIP_POOL", "PARTNER_SUMMIT"]).optional(),
    status: z.enum(["ALL", "UPCOMING", "LIVE", "COMPLETED"]).optional(),
    include_past: z.enum(["true", "false"]).optional(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
    date: z.string().date().optional(),
    utc_offset_minutes: z.coerce.number().int().min(-840).max(840).optional(),
  })
  .strict();

export async function GET(request: NextRequest) {
  try {
    const parsed = eventQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid event filters." },
        { status: 400 },
      );
    }
    const { category, status, month, date } = parsed.data;
    const offsetMilliseconds = (parsed.data.utc_offset_minutes ?? 0) * 60_000;
    const includePast = parsed.data.include_past === "true";

    const conditions: SQL[] = [];
    const now = new Date();
    const nowIso = now.toISOString();
    const effectiveStatus = sql<string>`case
      when ${events.status} = 'COMPLETED' or (${events.endsAt} is not null and ${events.endsAt} <= ${nowIso}::timestamptz) then 'COMPLETED'
      when ${events.startsAt} <= ${nowIso}::timestamptz then 'LIVE'
      else 'UPCOMING'
    end`;

    // Category filter
    if (category && category !== "ALL") {
      conditions.push(eq(events.category, category.toUpperCase()));
    }

    // Status filter
    if (status && status !== "ALL") {
      conditions.push(eq(effectiveStatus, status));
    }

    // Specific day filter
    if (date) {
      const startOfDay = new Date(Date.parse(`${date}T00:00:00.000Z`) + offsetMilliseconds);
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      conditions.push(lt(events.startsAt, endOfDay));
      conditions.push(or(gte(events.startsAt, startOfDay), gte(events.endsAt, startOfDay))!);
    } else if (month) {
      // Month range filter (e.g. 2026-09)
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10) - 1; // 0-indexed
      const startOfMonth = new Date(Date.UTC(year, monthNum, 1) + offsetMilliseconds);
      const endOfMonth = new Date(Date.UTC(year, monthNum + 1, 1) + offsetMilliseconds);
      conditions.push(lt(events.startsAt, endOfMonth));
      conditions.push(or(gte(events.startsAt, startOfMonth), gte(events.endsAt, startOfMonth))!);
    }

    if (!includePast && !date) {
      conditions.push(
        or(
          gte(events.startsAt, now),
          and(
            lt(events.startsAt, now),
            or(isNull(events.endsAt), gte(events.endsAt, now)),
          ),
        )!,
      );
      conditions.push(sql`${effectiveStatus} <> 'COMPLETED'`);
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
        status: effectiveStatus,
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
