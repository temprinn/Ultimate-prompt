import { fail, ok } from "@/lib/api/http";
import { query } from "@/lib/db/pool";

export async function GET() {
  const rows = await query<{ ok: number }[]>("SELECT 1 AS ok");
  if (!rows[0] || rows[0].ok !== 1) {
    return fail("Database is not reachable", 503, "DB_DOWN");
  }
  return ok({ status: "ok", database: "up" });
}
