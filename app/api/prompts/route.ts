import { getUserFromRequest, requireUser } from "@/lib/api/auth";
import { created, fail, ok } from "@/lib/api/http";
import { createPrompt, listPrompts } from "@/lib/catalog/prompt-repository";

function csv(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const { searchParams } = new URL(request.url);

  const prompts = await listPrompts(
    {
      q: searchParams.get("q") ?? undefined,
      toolTypes: csv(searchParams.get("toolTypes")),
      categories: csv(searchParams.get("categories")),
      sort: (searchParams.get("sort") as "all" | "popular" | "new") ?? "all",
      favoritesOnly: searchParams.get("favoritesOnly") === "1",
    },
    user
  );

  return ok({ items: prompts, total: prompts.length });
}

type CreateBody = {
  title?: string;
  description?: string;
  body?: string;
  tags?: string[];
  toolTypes?: string[];
  categories?: string[];
};

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth.error || !auth.user) {
    return fail("กรุณาเข้าสู่ระบบก่อนสร้างพรอมต์", 401, "UNAUTHORIZED");
  }

  const body = (await request.json().catch(() => ({}))) as CreateBody;
  const title = body.title?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const promptBody = body.body?.trim() ?? "";
  const tags = body.tags ?? [];
  const toolTypes = body.toolTypes ?? [];
  const categories = body.categories ?? [];

  if (title.length < 3) return fail("ชื่อเรื่องต้องมีอย่างน้อย 3 ตัวอักษร");
  if (description.length < 10) return fail("คำอธิบายย่อต้องมีอย่างน้อย 10 ตัวอักษร");
  if (promptBody.length < 20) return fail("เนื้อหาพรอมต์ต้องมีอย่างน้อย 20 ตัวอักษร");
  if (toolTypes.length === 0) return fail("ต้องเลือกประเภทเครื่องมืออย่างน้อย 1 รายการ");
  if (categories.length === 0) return fail("ต้องเลือกหมวดหมู่อย่างน้อย 1 รายการ");

  const prompt = await createPrompt({
    title,
    description,
    body: promptBody,
    tags,
    toolTypes,
    categories,
    createdBy: auth.user.id,
  });

  return created(prompt);
}
