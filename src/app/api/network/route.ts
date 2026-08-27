import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { users, referralNodes } from "@/src/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface NetworkMemberDTO {
  id: string;
  name: string;
  email: string;
  country: string;
  level: number;
  status: string;
  createdAt: string;
}

export interface NetworkSummaryResponse {
  totalMembers: number;
  activeCount: number;
  members: NetworkMemberDTO[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthenticated",
        },
        { status: 401 },
      );
    }

    // Query referral nodes where current user is the ancestor
    const rows = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        country: users.country,
        status: users.status,
        createdAt: users.createdAt,
        depth: referralNodes.depth,
      })
      .from(referralNodes)
      .innerJoin(users, eq(referralNodes.descendantId, users.id))
      .where(eq(referralNodes.ancestorId, session.userId))
      .orderBy(desc(referralNodes.createdAt))
      .limit(50);

    const members: NetworkMemberDTO[] = rows.map((r) => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
      country: r.country,
      level: r.depth,
      status: r.status,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    const totalMembers = members.length;
    const activeCount = members.filter((m) => m.status === "ACTIVE").length;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalMembers,
          activeCount,
          members,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching network summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load referral network.",
      },
      { status: 500 },
    );
  }
}
