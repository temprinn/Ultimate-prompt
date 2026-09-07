import { fail, ok } from "@/lib/api/http";
import { deleteSessionByToken, getTokenFromRequest } from "@/lib/auth/session";

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return fail("ไม่มี session", 401, "UNAUTHORIZED");
  }

  await deleteSessionByToken(token);
  return ok({ message: "ออกจากระบบแล้ว" });
}
