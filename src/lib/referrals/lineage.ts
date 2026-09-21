import { sql } from "drizzle-orm";
import { db } from "@/src/lib/db";

export interface ReferralLineageRow extends Record<string, unknown> {
  id: string;
  referred_by_id: string;
  depth: number;
}

/** The users' direct parent is authoritative; legacy closure rows can be stale. */
export async function getReferralLineage(rootUserId: string) {
  const rows = await db.execute<ReferralLineageRow>(sql`
    with recursive lineage as (
      select id, referred_by_id, 1::integer as depth
      from users
      where referred_by_id = ${rootUserId}
      union all
      select child.id, child.referred_by_id, lineage.depth + 1
      from users child
      inner join lineage on child.referred_by_id = lineage.id
      where lineage.depth < 10
    )
    select id, referred_by_id, depth from lineage
  `);
  return Array.from(rows);
}
