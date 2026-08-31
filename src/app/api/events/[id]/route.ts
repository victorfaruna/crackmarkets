import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { events } from "@/src/lib/db/schema/events";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
        status: events.status,
        created_at: events.createdAt,
        updated_at: events.updatedAt,
      })
      .from(events)
      .where(eq(events.id, id))
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
