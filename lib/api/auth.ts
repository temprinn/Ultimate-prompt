import { query } from "@/lib/db/pool";

export type ApiUser = {
  id: string;
  email: string | null;
  name: string;
  role: "free" | "admin";
};

export async function getUserFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const rows = await query<ApiUser[]>(
    `SELECT u.id, u.email, u.name, u.role
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.session_token = :token
       AND s.expires_at > UTC_TIMESTAMP(3)
     LIMIT 1`,
    { token }
  );

  return rows[0] ?? null;
}

export async function requireUser(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { user: null as ApiUser | null, error: "UNAUTHORIZED" as const };
  }
  return { user, error: null };
}
