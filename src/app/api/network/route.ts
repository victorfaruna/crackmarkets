import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/db/schema";
import { getReferralLineage } from "@/src/lib/referrals/lineage";
import type { BinaryPlacementMember } from "@/src/lib/referrals/binary-tree";
import { eq, inArray, sql } from "drizzle-orm";

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
  binaryMembers: BinaryPlacementMember[];
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

    const [currentUser] = await db
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    if (!currentUser || currentUser.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "User account is not active." },
        { status: 403 },
      );
    }

    const lineage = await getReferralLineage(session.userId);
    const descendants = lineage.length
      ? await db
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
      })
      .from(users)
      .where(inArray(users.id, lineage.map((row) => row.id)))
      : [];
    const depthById = new Map(lineage.map((row) => [row.id, row.depth]));
    const rows = descendants
      .map((row) => ({ ...row, depth: depthById.get(row.id) ?? 0 }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const directCounts = new Map<string, number>();
    const indirectCounts = new Map<string, number>();
    const parentById = new Map(
      rows.map((row) => [row.id, row.referredById]),
    );
    for (const row of rows) {
      if (row.referredById) {
        directCounts.set(
          row.referredById,
          (directCounts.get(row.referredById) ?? 0) + 1,
        );
      }
      let ancestorId = row.referredById
        ? parentById.get(row.referredById)
        : null;
      for (let depth = 2; ancestorId && depth <= 10; depth++) {
        indirectCounts.set(
          ancestorId,
          (indirectCounts.get(ancestorId) ?? 0) + 1,
        );
        ancestorId = parentById.get(ancestorId) ?? null;
      }
    }

    // Map rows into members
    const members: NetworkMemberDTO[] = rows.map((r) => {
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
        directsCount: directCounts.get(r.id) ?? 0,
        indirectsCount: indirectCounts.get(r.id) ?? 0,
        createdAt: r.createdAt.toISOString(),
      };
    });

    const totalMembers = members.length;
    const totalDirects = members.filter((m) => m.level === 1).length;
    const totalIndirects = members.filter((m) => m.level > 1).length;
    const activeCount = members.filter((m) => m.status === "ACTIVE").length;

    const placementRows = await db.execute<{
      user_id: string;
      parent_user_id: string;
      side: "LEFT" | "RIGHT";
      depth: number;
      first_name: string;
      last_name: string;
    }>(sql`
      with recursive placement_tree as (
        select placement.user_id, placement.parent_user_id, placement.side,
          1::integer as depth,
          array[${session.userId}::uuid, placement.user_id] as visited
        from binary_placements placement
        where placement.parent_user_id = ${session.userId}
        union all
        select child.user_id, child.parent_user_id, child.side,
          placement_tree.depth + 1,
          placement_tree.visited || child.user_id
        from binary_placements child
        join placement_tree on child.parent_user_id = placement_tree.user_id
        where not child.user_id = any(placement_tree.visited)
      )
      select placement_tree.user_id, placement_tree.parent_user_id,
        placement_tree.side, placement_tree.depth,
        member.first_name, member.last_name
      from placement_tree
      join users member on member.id = placement_tree.user_id
      order by placement_tree.depth, placement_tree.parent_user_id, placement_tree.side
    `);
    const binaryMembers: BinaryPlacementMember[] = Array.from(placementRows, (row) => ({
      id: row.user_id,
      parentId: row.parent_user_id,
      side: row.side,
      level: row.depth,
      name: `${row.first_name} ${row.last_name.charAt(0)}.`.trim(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          totalMembers,
          activeCount,
          totalDirects,
          totalIndirects,
          members,
          binaryMembers,
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
