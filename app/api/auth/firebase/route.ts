import { fail, ok } from "@/lib/api/http";
import { getApiErrorMessage } from "@/lib/api/error";
import { upsertFirebaseUser } from "@/lib/auth/firebase-user";
import { createSession } from "@/lib/auth/session";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";

type Body = {
  idToken?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const idToken = body.idToken?.trim();

  if (!idToken) {
    return fail("ต้องส่ง idToken", 400, "MISSING_ID_TOKEN");
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    const user = await upsertFirebaseUser(decoded);
    const token = await createSession(user.id);

    return ok({
      token,
      user,
      authorization: `Bearer ${token}`,
      provider: decoded.firebase?.sign_in_provider ?? "firebase",
    });
  } catch (error: unknown) {
    return fail(
      getApiErrorMessage(error, "ยืนยันตัวตนด้วย Firebase ไม่สำเร็จ"),
      401,
      "FIREBASE_AUTH_FAILED"
    );
  }
}
