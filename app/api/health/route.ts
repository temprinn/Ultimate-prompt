import { fail, ok } from "@/lib/api/http";
import { query } from "@/lib/db/pool";

function dbEnvHints() {
  return {
    hasHost: Boolean(process.env.MYSQL_HOST),
    hasPort: Boolean(process.env.MYSQL_PORT),
    hasUser: Boolean(process.env.MYSQL_USER),
    hasPassword: Boolean(process.env.MYSQL_PASSWORD),
    hasDatabase: Boolean(process.env.MYSQL_DATABASE),
    sslEnabled: process.env.MYSQL_SSL === "true",
    hasCaCert: Boolean(process.env.MYSQL_CA_CERT?.trim()),
    hasCaPath: Boolean(process.env.MYSQL_CA_PATH?.trim()),
    hostLooksLocal:
      process.env.MYSQL_HOST === "127.0.0.1" ||
      process.env.MYSQL_HOST === "localhost",
  };
}

export async function GET() {
  try {
    const rows = await query<{ ok: number }[]>("SELECT 1 AS ok");
    if (!rows[0] || rows[0].ok !== 1) {
      return fail("Database is not reachable", 503, "DB_DOWN");
    }
    return ok({ status: "ok", database: "up", env: dbEnvHints() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return fail(`${message} | env=${JSON.stringify(dbEnvHints())}`, 503, "DB_DOWN");
  }
}
