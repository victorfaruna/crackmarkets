import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { events } from "@/src/lib/db/schema/events";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID" },
        { status: 400 },
      );
    }

    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        category: events.category,
        description: events.description,
        reward_pool: events.rewardPool,
        location: events.location,
        starts_at: events.startsAt,
        ends_at: events.endsAt,
        status: sql<string>`case
          when ${events.status} = 'COMPLETED' or (${events.endsAt} is not null and ${events.endsAt} <= now()) then 'COMPLETED'
          when ${events.startsAt} <= now() then 'LIVE'
          else 'UPCOMING'
        end`,
        created_at: events.createdAt,
        updated_at: events.updatedAt,
      })
      .from(events)
      .where(eq(events.id, parsedId.data))
      .limit(1);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching event.",
      },
      { status: 500 },
    );
  }
}
