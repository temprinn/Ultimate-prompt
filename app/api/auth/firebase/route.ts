import { fail, ok } from "@/lib/api/http";
import { getApiErrorMessage } from "@/lib/api/error";
import { upsertFirebaseUser } from "@/lib/auth/firebase-user";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

type Body = {
  idToken?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const idToken = body.idToken?.trim();

    if (!idToken) {
      return fail("ต้องส่ง idToken", 400, "MISSING_ID_TOKEN");
    }

    const hasAdminJson = Boolean(
      process.env.FIREBASE_ADMIN_CREDENTIALS_JSON?.trim()
    );
    const hasAdminPath = Boolean(
      process.env.FIREBASE_ADMIN_CREDENTIALS_PATH?.trim()
    );

    if (!hasAdminJson && !hasAdminPath) {
      return fail(
        "Missing FIREBASE_ADMIN_CREDENTIALS_JSON on server",
        500,
        "FIREBASE_ADMIN_CONFIG_MISSING"
      );
    }

    const { verifyFirebaseIdToken } = await import("@/lib/firebase/admin");
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
    const message = getApiErrorMessage(
      error,
      "ยืนยันตัวตนด้วย Firebase ไม่สำเร็จ"
    );
    const detail = error instanceof Error ? error.message : message;
    return fail(detail, 401, "FIREBASE_AUTH_FAILED");
  }
}
