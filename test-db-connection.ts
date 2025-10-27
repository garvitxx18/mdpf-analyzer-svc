import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

console.log("Testing database connection...");
console.log("DATABASE_URL:", connectionString?.substring(0, 20) + "...");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.query("SELECT NOW()")
  .then((result) => {
    console.log("✅ Database connected successfully!");
    console.log("Current time:", result.rows[0].now);
    pool.end();
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    pool.end();
    process.exit(1);
  });

