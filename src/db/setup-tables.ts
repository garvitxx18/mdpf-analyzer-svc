import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const setupTables = async () => {
  try {
    const migrationFile = path.join(__dirname, "../db/drizzle/migrations/0000_soft_steel_serpent.sql");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    await pool.query(sql);
    console.log("✅ Tables created successfully");
  } catch (error) {
    console.error("Error setting up tables:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

setupTables().catch(console.error);

