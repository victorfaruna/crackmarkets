import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { requireServerEnv } from "@/src/lib/config/env";

const connectionString = requireServerEnv("DATABASE_URL");

// Global cache to prevent exhausted connections in Next.js HMR/serverless development
declare global {
  var __postgresClient: postgres.Sql | undefined;
  var __drizzleDb: PostgresJsDatabase<typeof schema> | undefined;
}

let client: postgres.Sql;
let db: PostgresJsDatabase<typeof schema>;

if (process.env.NODE_ENV === "production") {
  client = postgres(connectionString, { max: 20 });
  db = drizzle(client, { schema });
} else {
  if (!global.__postgresClient) {
    global.__postgresClient = postgres(connectionString, { max: 10 });
  }
  client = global.__postgresClient;
  if (!global.__drizzleDb) {
    global.__drizzleDb = drizzle(client, { schema });
  }
  db = global.__drizzleDb;
}

export { db, client };
export default db;
