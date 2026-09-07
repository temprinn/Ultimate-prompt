import { requireUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { getPromptById } from "@/lib/catalog/prompt-repository";
import {
  getRatingFeedbackStatus,
  upsertPromptRating,
} from "@/lib/catalog/rating-repository";

export async function GET(
  request: Request,
  context: RouteContext<"/api/prompts/[id]/rating">
) {
  const auth = await requireUser(request);
  if (auth.error || !auth.user) {
    return fail("กรุณาเข้าสู่ระบบก่อนให้คะแนนพรอมต์", 401, "UNAUTHORIZED");
  }

  const { id } = await context.params;
  const prompt = await getPromptById(id, auth.user);
  if (!prompt) {
    return fail("ไม่พบพรอมต์", 404, "NOT_FOUND");
  }

  const status = await getRatingFeedbackStatus(id, auth.user.id);
  return ok({
    promptId: id,
    ...status,
  });
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/prompts/[id]/rating">
) {
  const auth = await requireUser(request);
  if (auth.error || !auth.user) {
    return fail("กรุณาเข้าสู่ระบบก่อนให้คะแนนพรอมต์", 401, "UNAUTHORIZED");
  }

  const { id } = await context.params;
  const body = (await request.json()) as { stars?: unknown };
  const stars = Number(body.stars);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return fail("กรุณาเลือกคะแนน 1–5 ดาว", 400, "INVALID_STARS");
  }

  const result = await upsertPromptRating(id, auth.user, stars);

  if (result.status === "not_found") {
    return fail("ไม่พบพรอมต์", 404, "NOT_FOUND");
  }

  if (result.status === "not_copied") {
    return fail(
      "ต้องคัดลอกพรอมต์ก่อนจึงจะให้คะแนนได้",
      400,
      "NOT_COPIED"
    );
  }

  return ok({
    message: "ขอบคุณสำหรับคะแนน!",
    promptId: id,
    stars: result.stars,
    prompt: result.prompt,
  });
}
