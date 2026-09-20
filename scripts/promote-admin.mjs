import postgres from "postgres";

const email = process.argv[2]?.trim().toLowerCase();
const connectionString = process.env.DATABASE_URL;

if (!email || !email.includes("@")) {
  console.error("Usage: yarn admin:promote admin@example.com");
  process.exitCode = 1;
} else if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exitCode = 1;
} else {
  const sql = postgres(connectionString, { max: 1 });
  try {
    const [admin] = await sql.begin(async (transaction) => {
      const updated = await transaction`
        update users
        set role = 'ADMIN', status = 'ACTIVE', updated_at = now()
        where lower(email) = ${email}
        returning id, email
      `;

      if (updated[0]) {
        await transaction`
          insert into audit_logs (user_id, action, details)
          values (
            ${updated[0].id},
            'ADMIN_ROLE_GRANTED',
            ${transaction.json({ source: "admin:promote" })}
          )
        `;
      }
      return updated;
    });

    if (!admin) {
      console.error(`No registered user found for ${email}.`);
      process.exitCode = 1;
    } else {
      console.log(`${admin.email} can now sign in at /admin/login.`);
    }
  } catch (error) {
    console.error("Unable to promote administrator:", error.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}
