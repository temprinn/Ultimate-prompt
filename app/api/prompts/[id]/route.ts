import { getUserFromRequest } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { deletePrompt, getPromptById } from "@/lib/catalog/prompt-repository";

export async function GET(
  request: Request,
  context: RouteContext<"/api/prompts/[id]">
) {
  const { id } = await context.params;
  const user = await getUserFromRequest(request);
  const prompt = await getPromptById(id, user);
  if (!prompt) {
    return fail("ไม่พบพรอมต์", 404, "NOT_FOUND");
  }
  return ok(prompt);
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/prompts/[id]">
) {
  const { id } = await context.params;
  const user = await getUserFromRequest(request);
  if (!user) {
    return fail("กรุณาเข้าสู่ระบบก่อนลบพรอมต์", 401, "UNAUTHORIZED");
  }

  const result = await deletePrompt(id);
  if (result.status === "not_found") {
    return fail("ไม่พบพรอมต์", 404, "NOT_FOUND");
  }

  return ok({ message: "ลบพรอมต์แล้ว", promptId: id });
}
