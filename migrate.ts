import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🚀 WorkSchedulerLite — Database Migration\n");

  // Companies table — stores all company data as JSONB
  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      pin TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ Companies table created");

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_companies_id ON companies(id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_companies_updated ON companies(updated_at DESC)`;
  console.log("✅ Indexes created");

  console.log("\n🎉 Migration complete!");
}

migrate().catch(console.error);
