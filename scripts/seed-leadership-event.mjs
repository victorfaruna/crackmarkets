/**
 * One-shot seed: Leadership Package Target – 15 Leaders Only
 * Run with: node --env-file=.env scripts/seed-leadership-event.mjs
 *
 * Extracted from the promotional poster shared by the admin.
 */
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exitCode = 1;
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

try {
  // Idempotent: skip if an event with the same title already exists
  const existing = await sql`
    SELECT id FROM events WHERE title = ${'Leadership Package Target – 15 Leaders Only'} LIMIT 1
  `;

  if (existing.length > 0) {
    console.log(`Event already exists (id: ${existing[0].id}). Skipping.`);
    process.exit(0);
  }

  const description = `
TrackMarkets × RoboForex – Leadership Package Target

We are opening a special Leadership Movement designed to identify and empower 15 committed leaders who are ready to take their business, team, and personal growth to the next level.

ONE MOVEMENT · ONE TARGET · ONE DESTINATION

LEADERSHIP BENEFITS:
• Full sponsorship of all events organized through TrackMarkets and RoboForex.
• Additional funds paid based on team trading volumes, separate from the compensation plan.
• Fully funded travel trips and regional business trips.
• Exclusive leadership opportunities, recognition, and participation in strategic movements.
• Opportunity to build and lead a high-volume, high-performing team.

LEADERSHIP QUALIFICATION TARGET (September 15 – October 5, 2026):
Each aspiring leader must generate a minimum of $10,000 in Direct Referral Trading Volume.

This trading volume can come from:
✓ Your personal/self-funded trading volume, and/or
✓ The combined funded and trading volume of your first-level direct referrals.

Important: The focus is not simply on registration. Leaders must demonstrate actual funded and trading activity within the qualification period.

THE GOAL: Only 15 leaders will be selected for this special leadership movement.

15 Leaders. $10,000 Target. One Strong Movement. One Bigger Vision.

If you have the capacity to lead, build, and produce results, this is your opportunity to step forward. The question is not whether the opportunity exists. The question is: WILL YOU QUALIFY?
  `.trim();

  const [inserted] = await sql`
    INSERT INTO events (
      title,
      category,
      description,
      reward_pool,
      image_url,
      location,
      starts_at,
      ends_at,
      status,
      created_at,
      updated_at
    ) VALUES (
      ${'Leadership Package Target – 15 Leaders Only'},
      ${'LEADERSHIP_POOL'},
      ${description},
      ${'$10,000 Direct Referral Trading Volume Target + Travel Trips, Business Trips & Exclusive Leadership Benefits'},
      ${'/images/leadership-package-target.jpg'},
      ${'Global / Online – TrackMarkets × RoboForex'},
      ${'2026-09-15T00:00:00+00:00'},
      ${'2026-10-05T23:59:59+00:00'},
      ${'LIVE'},
      now(),
      now()
    )
    RETURNING id, title, category, starts_at, ends_at
  `;

  console.log("✅ Event created successfully:");
  console.log(`   ID       : ${inserted.id}`);
  console.log(`   Title    : ${inserted.title}`);
  console.log(`   Category : ${inserted.category}`);
  console.log(`   Starts   : ${inserted.starts_at}`);
  console.log(`   Ends     : ${inserted.ends_at}`);
} catch (error) {
  console.error("Failed to insert event:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
