import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function createTables() {
  try {
    console.log("📖 Reading migration SQL...");
    const sql = fs.readFileSync("./src/db/drizzle/migrations/0000_soft_steel_serpent.sql", "utf-8");
    
    console.log("🔧 Creating tables...");
    await pool.query(sql);
    
    console.log("✅ Tables created successfully in Supabase!");
    
    pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    pool.end();
    process.exit(1);
  }
}

createTables();

