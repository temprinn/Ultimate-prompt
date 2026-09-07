/**
 * One-off: apply fresh schema + seed to Aiven (defaultdb).
 * Skips migrations 04–06 — init/01-schema.sql already matches final schema.
 */
const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.resolve(".env") });

function prepareSql(raw) {
  return raw
    .replace(/CREATE DATABASE IF NOT EXISTS ultimate_prompts[\s\S]*?;\s*/i, "")
    .replace(/USE\s+ultimate_prompts\s*;/gi, "USE defaultdb;");
}

async function runFile(conn, filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const sql = prepareSql(raw);
  console.log(`→ ${path.relative(process.cwd(), filePath)}`);
  await conn.query(sql);
}

async function main() {
  const caPath = path.resolve(process.env.MYSQL_CA_PATH || "./secrets/ca.pem");
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "defaultdb",
    multipleStatements: true,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caPath, "utf8"),
    },
  });

  const files = [
    "docker/mysql/init/00-charset.sql",
    "docker/mysql/init/01-schema.sql",
    "docker/mysql/init/02-seed.sql",
    "docker/mysql/init/03-seed-demo.sql",
  ];

  for (const file of files) {
    await runFile(conn, path.resolve(file));
  }

  const [tables] = await conn.query("SHOW TABLES");
  console.log("Tables:", tables.map((r) => Object.values(r)[0]).join(", "));

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
