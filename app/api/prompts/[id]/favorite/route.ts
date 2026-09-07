import { requireUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { getPromptById, toggleFavorite } from "@/lib/catalog/prompt-repository";

export async function POST(
  request: Request,
  context: RouteContext<"/api/prompts/[id]/favorite">
) {
  const auth = await requireUser(request);
  if (auth.error || !auth.user) {
    return fail("กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด", 401, "UNAUTHORIZED");
  }

  const { id } = await context.params;
  const prompt = await getPromptById(id, auth.user);
  if (!prompt) {
    return fail("ไม่พบพรอมต์", 404, "NOT_FOUND");
  }

  const result = await toggleFavorite(id, auth.user.id);
  return ok({
    promptId: id,
    isFavorite: result.isFavorite,
  });
}
