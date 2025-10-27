import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const getConnectionString = () => {
  return process.env.DATABASE_URL || 
    "postgresql://postgres.lcgefdrxyeusyiidsayh:yRuwYT5hqxtlDRUK@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";
};

const connectionString = getConnectionString();

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
