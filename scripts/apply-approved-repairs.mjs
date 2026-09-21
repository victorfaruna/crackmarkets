import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (process.argv[2] !== "--apply") {
  throw new Error("Pass --apply to run the approved referral and wallet repairs.");
}

function statements(script) {
  const parts = script.split(";").map((part) => part.trim()).filter(Boolean);
  if (!parts[0]?.toLowerCase().endsWith("begin") || parts.at(-1)?.toLowerCase() !== "commit") {
    throw new Error("Expected a reviewed transaction script.");
  }
  return parts.slice(1, -1);
}

const referralSql = await readFile(new URL("./repair-referral-lineage.sql", import.meta.url), "utf8");
const walletSql = await readFile(new URL("./backfill-wallets.sql", import.meta.url), "utf8");
const db = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 5 });

try {
  const result = await db.begin(async (tx) => {
    const [transactionCount] = await tx`select count(*)::int as count from transactions`;
    if (transactionCount.count !== 0) {
      throw new Error("Commission or withdrawal transactions now exist; review attribution before repairing lineage.");
    }

    for (const statement of [...statements(referralSql), ...statements(walletSql)]) {
      await tx.unsafe(statement);
    }

    const [lineage] = await tx`
      with recursive expected as (
        select id as descendant_id, referred_by_id as ancestor_id, 1 as depth
        from users where referred_by_id is not null
        union all
        select expected.descendant_id, parent.referred_by_id, expected.depth + 1
        from expected
        inner join users parent on parent.id = expected.ancestor_id
        where parent.referred_by_id is not null and expected.depth < 10
      )
      select
        (select count(*)::int from expected e where not exists (
          select 1 from referral_nodes r
          where r.ancestor_id = e.ancestor_id and r.descendant_id = e.descendant_id and r.depth = e.depth
        )) as missing_links,
        (select count(*)::int from referral_nodes r where not exists (
          select 1 from expected e
          where e.ancestor_id = r.ancestor_id and e.descendant_id = r.descendant_id and e.depth = r.depth
        )) as stale_links
    `;
    const [wallets] = await tx`
      select count(*)::int as missing_wallets
      from users u where not exists (select 1 from wallets w where w.user_id = u.id)
    `;
    if (lineage.missing_links || lineage.stale_links || wallets.missing_wallets) {
      throw new Error("Repair verification failed; no changes were committed.");
    }
    return { ...lineage, ...wallets };
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} finally {
  await db.end({ timeout: 1 });
}
