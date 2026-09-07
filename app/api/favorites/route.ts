import { requireUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { listPrompts } from "@/lib/catalog/prompt-repository";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error || !auth.user) {
    return fail("กรุณาเข้าสู่ระบบก่อนดูรายการโปรด", 401, "UNAUTHORIZED");
  }

  const items = await listPrompts(
    { favoritesOnly: true, sort: "new" },
    auth.user
  );
  return ok({ items, total: items.length });
}
