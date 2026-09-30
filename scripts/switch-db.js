const fs = require("fs");
const path = require("path");

const target = process.argv[2]?.toLowerCase();

if (!target || !["postgres", "postgresql", "sqlite"].includes(target)) {
  console.log("Usage: node scripts/switch-db.js [postgres | sqlite]");
  process.exit(1);
}

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let content = fs.readFileSync(schemaPath, "utf8");

if (target === "postgres" || target === "postgresql") {
  console.log("Switching Prisma schema to PostgreSQL (production ready for Vercel/Neon/Supabase)...");
  
  const postgresDatasource = `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`;

  content = content.replace(/datasource\s+db\s*\{[\s\S]*?\}/, postgresDatasource);
  fs.writeFileSync(schemaPath, content, "utf8");
  console.log("SUCCESS: prisma/schema.prisma datasource set to PostgreSQL.");
  console.log("Next steps for Vercel/Postgres deployment:");
  console.log("1. Set DATABASE_URL and DIRECT_URL in your .env or Vercel Environment Variables");
  console.log("2. Run: npx prisma db push");
} else if (target === "sqlite") {
  console.log("Switching Prisma schema to SQLite (local offline development)...");
  
  const sqliteDatasource = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;

  content = content.replace(/datasource\s+db\s*\{[\s\S]*?\}/, sqliteDatasource);
  fs.writeFileSync(schemaPath, content, "utf8");
  console.log("SUCCESS: prisma/schema.prisma datasource set to SQLite.");
}
