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
  referralCode?: string;
  referredById?: string | null;
  roboforexId?: string | null;
  roboforexLinked?: boolean;
  directsCount?: number;
  indirectsCount?: number;
  createdAt: string;
}

export interface NetworkSummaryResponse {
  totalMembers: number;
  activeCount: number;
  totalDirects: number;
  totalIndirects: number;
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
        referralCode: users.referralCode,
        referredById: users.referredById,
        roboforexId: users.roboforexId,
        roboforexLinked: users.roboforexLinked,
        createdAt: users.createdAt,
        depth: referralNodes.depth,
      })
      .from(referralNodes)
      .innerJoin(users, eq(referralNodes.descendantId, users.id))
      .where(eq(referralNodes.ancestorId, session.userId))
      .orderBy(desc(referralNodes.createdAt))
      .limit(100);

    // Map rows into members
    const members: NetworkMemberDTO[] = rows.map((r) => {
      // Calculate directs under this member within the fetched lineage
      const memberDirects = rows.filter((other) => other.referredById === r.id);
      return {
        id: r.id,
        name: `${r.firstName} ${r.lastName}`.trim(),
        email: r.email,
        country: r.country,
        level: r.depth,
        status: r.status,
        referralCode: r.referralCode,
        referredById: r.referredById,
        roboforexId: r.roboforexId,
        roboforexLinked: r.roboforexLinked,
        directsCount: memberDirects.length,
        indirectsCount: 0,
        createdAt: r.createdAt
          ? new Date(r.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    const totalMembers = members.length;
    const totalDirects = members.filter((m) => m.level === 1).length;
    const totalIndirects = members.filter((m) => m.level > 1).length;
    const activeCount = members.filter((m) => m.status === "ACTIVE").length;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalMembers,
          activeCount,
          totalDirects,
          totalIndirects,
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
