import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

const getConnectionString = () => {
  return (
    process.env.DATABASE_URL ||
    "postgresql://postgres.lcgefdrxyeusyiidsayh:yRuwYT5hqxtlDRUK@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
  );
};

const applyMigration = async () => {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const migrationFile = join(
    __dirname,
    "drizzle/migrations/0001_flat_phil_sheldon.sql"
  );

  const sql = readFileSync(migrationFile, "utf-8");

  const statements = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  const client = await pool.connect();

  try {
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log("✓ Executed:", statement.substring(0, 60) + "...");
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("already exists") ||
            error.message.includes("duplicate"))
        ) {
          console.log(
            "⊘ Skipped (already exists):",
            statement.substring(0, 60) + "..."
          );
        } else {
          console.error(
            "✗ Error executing:",
            statement.substring(0, 60) + "..."
          );
          console.error(error);
          throw error;
        }
      }
    }

    console.log("\n✅ Migration applied successfully!");
  } finally {
    client.release();
    await pool.end();
  }
};

applyMigration()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });

