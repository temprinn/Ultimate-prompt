import { fail, ok } from "@/lib/api/http";

export const runtime = "nodejs";

/** Temporary diagnostics for Vercel Firebase Admin setup. */
export async function GET() {
  const hasAdminJson = Boolean(
    process.env.FIREBASE_ADMIN_CREDENTIALS_JSON?.trim()
  );
  const jsonLength = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON?.trim().length ?? 0;

  let parseOk = false;
  let parseError: string | null = null;
  let hasPrivateKey = false;
  let projectId: string | null = null;

  if (hasAdminJson) {
    try {
      const parsed = JSON.parse(
        process.env.FIREBASE_ADMIN_CREDENTIALS_JSON!.trim()
      ) as {
        project_id?: string;
        private_key?: string;
      };
      parseOk = true;
      projectId = parsed.project_id ?? null;
      hasPrivateKey = Boolean(parsed.private_key?.includes("PRIVATE KEY"));
    } catch (error: unknown) {
      parseError = error instanceof Error ? error.message : "JSON parse failed";
    }
  }

  let adminImportOk = false;
  let adminImportError: string | null = null;
  try {
    await import("@/lib/firebase/admin");
    adminImportOk = true;
  } catch (error: unknown) {
    adminImportError =
      error instanceof Error ? error.message : "admin import failed";
  }

  return ok({
    hasAdminJson,
    jsonLength,
    parseOk,
    parseError,
    hasPrivateKey,
    projectId,
    adminImportOk,
    adminImportError,
  });
}
