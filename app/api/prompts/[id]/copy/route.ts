import { requireUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { copyPrompt } from "@/lib/catalog/prompt-repository";

export async function POST(
  request: Request,
  context: RouteContext<"/api/prompts/[id]/copy">
) {
  const { id } = await context.params;
  const auth = await requireUser(request);
  if (auth.error || !auth.user) {
    return fail("กรุณาเข้าสู่ระบบก่อนคัดลอกพรอมต์", 401, "UNAUTHORIZED");
  }

  const result = await copyPrompt(id, auth.user);

  if (result.status === "not_found") {
    return fail("ไม่พบพรอมต์", 404, "NOT_FOUND");
  }

  return ok({
    message: "คัดลอกสำเร็จ!",
    body: result.body,
    counted: result.counted,
    prompt: result.prompt,
  });
}
