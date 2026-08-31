import { db } from "./index";
import { users, wallets, transactions, referralNodes } from "./schema";
import { eq, inArray } from "drizzle-orm";

async function seedRealisticData() {
  console.log("🌱 Populating realistic production database data...");

  // 1. Fetch existing users
  const existingUsers = await db.select().from(users);
  console.log(`Found ${existingUsers.length} existing users.`);

  if (existingUsers.length === 0) {
    console.log("No users found.");
    process.exit(0);
  }

  // Downline test members to create for each user if needed
  const downlineTemplates = [
    {
      firstName: "Alexander",
      lastName: "Wright",
      email: "alex.wright@markets.io",
      country: "United Kingdom",
      status: "ACTIVE",
      referralCode: "CRK-ALEX99",
      depth: 1,
    },
    {
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena.rostova@traders.eu",
      country: "Germany",
      status: "ACTIVE",
      referralCode: "CRK-ELEN82",
      depth: 1,
    },
    {
      firstName: "Marcus",
      lastName: "Vance",
      email: "m.vance@investcapital.com",
      country: "United States",
      status: "ACTIVE",
      referralCode: "CRK-MARC44",
      depth: 1,
    },
    {
      firstName: "Sophie",
      lastName: "Chen",
      email: "sophie.chen@asiaforex.sg",
      country: "Singapore",
      status: "ACTIVE",
      referralCode: "CRK-SOPH12",
      depth: 2,
    },
    {
      firstName: "David",
      lastName: "Okonkwo",
      email: "david.o@africatrade.ng",
      country: "Nigeria",
      status: "ACTIVE",
      referralCode: "CRK-DAVI77",
      depth: 2,
    },
    {
      firstName: "Mateo",
      lastName: "Silva",
      email: "mateo.silva@latamfx.br",
      country: "Brazil",
      status: "ACTIVE",
      referralCode: "CRK-MATE33",
      depth: 3,
    },
    {
      firstName: "Chloe",
      lastName: "Dubois",
      email: "chloe.dubois@eurocap.fr",
      country: "France",
      status: "ACTIVE",
      referralCode: "CRK-CHLO55",
      depth: 4,
    },
  ];

  for (const rootUser of existingUsers) {
    console.log(`\nSetting up data for user: ${rootUser.email} (${rootUser.id})`);

    // Ensure referral nodes and downlines exist for this user
    for (const dt of downlineTemplates) {
      // Check if downline user already exists
      const [existingDownline] = await db
        .select()
        .from(users)
        .where(eq(users.email, `${rootUser.id.slice(0, 4)}_${dt.email}`))
        .limit(1);

      let downlineId = existingDownline?.id;

      if (!existingDownline) {
        const [newUser] = await db
          .insert(users)
          .values({
            firstName: dt.firstName,
            lastName: dt.lastName,
            email: `${rootUser.id.slice(0, 4)}_${dt.email}`,
            phoneNumber: `+44 7700 ${Math.floor(100000 + Math.random() * 900000)}`,
            country: dt.country,
            status: dt.status,
            referralCode: `${rootUser.id.slice(0, 4)}_${dt.referralCode}`,
            referredById: rootUser.id,
            passwordHash: "$2a$12$e6k8gQz3X5gC11928374829102938475829102938475829102938",
            kycStatus: "APPROVED",
            fundingStatus: "UNLOCKED",
            roboforexLinked: true,
            roboforexId: `RBX-${Math.floor(100000 + Math.random() * 900000)}`,
          })
          .returning();
        downlineId = newUser.id;

        // Insert referral node closure record
        await db.insert(referralNodes).values({
          ancestorId: rootUser.id,
          descendantId: downlineId,
          depth: dt.depth,
        });
      }
    }

    // Clear old transactions for this user and create full realistic commission set
    await db.delete(transactions).where(eq(transactions.userId, rootUser.id));

    const now = new Date();
    const txRecords = [
      {
        userId: rootUser.id,
        transactionType: "COMMISSION_BONUS_1",
        amount: "580.0000",
        referenceId: "TX-PRF1-984210",
        level: 1,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000), // 2h ago
      },
      {
        userId: rootUser.id,
        transactionType: "LOT_BONUS_2",
        amount: "340.5000",
        referenceId: "TX-LOT2-771204",
        level: 1,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 6 * 3600 * 1000), // 6h ago
      },
      {
        userId: rootUser.id,
        transactionType: "COMMISSION_BONUS_1",
        amount: "420.2500",
        referenceId: "TX-PRF1-662914",
        level: 2,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 14 * 3600 * 1000), // 14h ago
      },
      {
        userId: rootUser.id,
        transactionType: "LOT_BONUS_2",
        amount: "210.0000",
        referenceId: "TX-LOT2-551029",
        level: 2,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 22 * 3600 * 1000), // 22h ago
      },
      {
        userId: rootUser.id,
        transactionType: "STRONG_LEG_BONUS_3",
        amount: "1500.0000",
        referenceId: "TX-STR3-441092",
        level: 1,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 36 * 3600 * 1000), // 1.5 days ago
      },
      {
        userId: rootUser.id,
        transactionType: "VOLUME_BONUS_4",
        amount: "1250.0000",
        referenceId: "TX-VOL4-332901",
        level: 3,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000), // 2 days ago
      },
      {
        userId: rootUser.id,
        transactionType: "WITHDRAWAL",
        amount: "1000.0000",
        referenceId: "WTH-TRC20-881923",
        level: null,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 60 * 3600 * 1000), // 2.5 days ago
      },
      {
        userId: rootUser.id,
        transactionType: "LEADERSHIP_REWARD",
        amount: "2000.0000",
        referenceId: "RWD-LEAD5-220194",
        level: null,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 72 * 3600 * 1000), // 3 days ago
      },
      {
        userId: rootUser.id,
        transactionType: "COMMISSION_BONUS_1",
        amount: "310.0000",
        referenceId: "TX-PRF1-119482",
        level: 3,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 96 * 3600 * 1000), // 4 days ago
      },
      {
        userId: rootUser.id,
        transactionType: "LOT_BONUS_2",
        amount: "175.0000",
        referenceId: "TX-LOT2-990142",
        level: 3,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 120 * 3600 * 1000), // 5 days ago
      },
      {
        userId: rootUser.id,
        transactionType: "DEPOSIT",
        amount: "10000.0000",
        referenceId: "DEP-ROBO-440182",
        level: null,
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 144 * 3600 * 1000), // 6 days ago
      },
    ];

    await db.insert(transactions).values(txRecords);

    // Calculate total earned and update wallet atomically
    const totalCommissionsEarned = 580 + 340.5 + 420.25 + 210 + 1500 + 1250 + 2000 + 310 + 175; // 6785.75
    const totalWithdrawn = 1000.0;
    const availableBalance = totalCommissionsEarned - totalWithdrawn; // 5785.75

    await db
      .insert(wallets)
      .values({
        userId: rootUser.id,
        balance: totalCommissionsEarned.toFixed(4),
        availableBalance: availableBalance.toFixed(4),
        totalWithdrawn: totalWithdrawn.toFixed(4),
        lifetimeEarnings: totalCommissionsEarned.toFixed(4),
      })
      .onConflictDoUpdate({
        target: wallets.userId,
        set: {
          balance: totalCommissionsEarned.toFixed(4),
          availableBalance: availableBalance.toFixed(4),
          totalWithdrawn: totalWithdrawn.toFixed(4),
          lifetimeEarnings: totalCommissionsEarned.toFixed(4),
          updatedAt: new Date(),
        },
      });

    console.log(`✅ Updated wallet & seeded 11 transactions for ${rootUser.email}`);
  }

  console.log("🎉 Real database data successfully synchronized!");
  process.exit(0);
}

seedRealisticData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
