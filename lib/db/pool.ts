import fs from "node:fs";
import path from "node:path";
import mysql, { type QueryResult, type ResultSetHeader } from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

function normalizePem(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function resolveCa(): string | undefined {
  const caCert = process.env.MYSQL_CA_CERT?.trim();
  if (caCert) {
    return normalizePem(caCert);
  }

  const caPath = process.env.MYSQL_CA_PATH;
  if (!caPath) {
    return undefined;
  }

  return fs.readFileSync(path.resolve(caPath), "utf8");
}

function resolveSsl() {
  if (process.env.MYSQL_SSL !== "true") {
    return undefined;
  }

  const ca = resolveCa();
  return {
    rejectUnauthorized: true,
    ...(ca ? { ca } : {}),
  };
}

function createPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "app",
    password: process.env.MYSQL_PASSWORD ?? "app",
    database: process.env.MYSQL_DATABASE ?? "ultimate_prompts",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    ssl: resolveSsl(),
  });
}

export function getPool() {
  if (!globalForDb.mysqlPool) {
    globalForDb.mysqlPool = createPool();
  }
  return globalForDb.mysqlPool;
}

export async function query<T = QueryResult>(
  sql: string,
  params?: Record<string, string | number | boolean | null>
) {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}

export async function execute(sql: string, params?: Record<string, string | number | boolean | null>) {
  const [result] = await getPool().execute(sql, params);
  return result as ResultSetHeader;
}
