import { ok } from "@/lib/api/http";
import { query } from "@/lib/db/pool";

export async function GET() {
  const items = await query<{ id: string; slug: string; label: string }[]>(
    `SELECT id, slug, label FROM tool_types ORDER BY label ASC`
  );
  return ok({ items });
}
