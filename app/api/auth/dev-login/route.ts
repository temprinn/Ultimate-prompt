import { fail, ok } from "@/lib/api/http";
import { createSession, ensureDemoUser } from "@/lib/auth/dev-session";

type Body = {
  role?: "free" | "admin";
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return fail("ไม่พร้อมใช้งาน", 404, "NOT_FOUND");
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const role = body.role ?? "free";
  if (!["free", "admin"].includes(role)) {
    return fail("role ต้องเป็น free | admin", 400, "INVALID_ROLE");
  }

  const user = await ensureDemoUser(role);
  const token = await createSession(user.id);

  return ok({
    token,
    user,
    authorization: `Bearer ${token}`,
  });
}
