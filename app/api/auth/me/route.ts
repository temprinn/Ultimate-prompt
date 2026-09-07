import { fail, ok } from "@/lib/api/http";
import { getUserFromRequest } from "@/lib/api/auth";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return fail("กรุณาเข้าสู่ระบบ", 401, "UNAUTHORIZED");
  }
  return ok(user);
}
