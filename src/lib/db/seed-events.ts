import { db } from "./index";
import { events } from "./schema/events";

const NOW = new Date();

const seedData = [
  {
    title: "Global Partner Trading Championship (Q3 2026)",
    category: "TRADING_CONTEST",
    description:
      "Compete for the highest lot volume and trading performance across your 10-level organization. Top leaders qualify for additional pool shares. The competition spans four weeks on live RoboForex accounts.",
    rewardPool: "$50,000 USDT",
    location: "Online / RoboForex Servers",
    startsAt: new Date("2026-09-15T14:00:00Z"),
    endsAt: new Date("2026-10-15T23:59:59Z"),
    status: "UPCOMING",
  },
  {
    title: "Track Markets Leadership Incentive Summit",
    category: "PARTNER_SUMMIT",
    description:
      "Exclusive summit for Tier 4+ qualified leaders. Includes strategic workshops on 10-level network optimization, luxury networking, and grand estate qualification previews.",
    rewardPool: "Luxury Travel & Accommodation",
    location: "Dubai, UAE",
    startsAt: new Date("2026-10-02T10:00:00Z"),
    endsAt: new Date("2026-10-04T18:00:00Z"),
    status: "UPCOMING",
  },
  {
    title: "Advanced RoboForex Strategy & Multi-Level Scaling",
    category: "WEBINAR",
    description:
      "Master session on optimizing 10-level downlines, lot rebate distributions, and high-frequency trading risk management with RoboForex ECN accounts.",
    rewardPool: null,
    location: "Zoom Live Stream",
    startsAt: new Date("2026-09-05T18:00:00Z"),
    endsAt: new Date("2026-09-05T20:00:00Z"),
    status: "UPCOMING",
  },
  {
    title: "Monthly Leader Pool Payout & Verification Window",
    category: "LEADERSHIP_POOL",
    description:
      "End of month qualification snapshot for Strong Leg bonuses and percentage volume ladders (Tiers 1 to 9). Ensure your team volume meets thresholds before this cutoff.",
    rewardPool: "$100,000 Pool Allocation",
    location: "Automated Ledger",
    startsAt: new Date("2026-09-30T00:00:00Z"),
    endsAt: new Date("2026-09-30T23:59:59Z"),
    status: "UPCOMING",
  },
  {
    title: "October Lot Volume Webinar — Bonus 2 Maximization",
    category: "WEBINAR",
    description:
      "Deep dive into Lot Distribution Bonus (Bonus 2): how to structure your downline for maximum $2.00/lot payouts at Levels 1–3 and $0.50/lot at Levels 5–10.",
    rewardPool: null,
    location: "Google Meet",
    startsAt: new Date("2026-10-10T16:00:00Z"),
    endsAt: new Date("2026-10-10T17:30:00Z"),
    status: "UPCOMING",
  },
  {
    title: "Q2 2026 Leadership Pool — Completed Snapshot",
    category: "LEADERSHIP_POOL",
    description:
      "Completed Q2 2026 qualification window. Winners received Travel Benefit ($2,000 cash equivalent) for maintaining $50,000 monthly team deposits for 3 consecutive months.",
    rewardPool: "$2,000 Cash Equivalent",
    location: "Automated Ledger",
    startsAt: new Date("2026-06-30T23:59:59Z"),
    endsAt: new Date("2026-06-30T23:59:59Z"),
    status: "COMPLETED",
  },
] satisfies Array<typeof events.$inferInsert>;

async function seed() {
  console.log("🌱 Seeding events...");
  await db.delete(events);
  await db.insert(events).values(seedData);
  console.log(`✅ Inserted ${seedData.length} events.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
