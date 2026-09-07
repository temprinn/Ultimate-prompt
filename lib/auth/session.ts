import { randomUUID } from "crypto";
import { query } from "@/lib/db/pool";

export async function createSession(userId: string) {
  const id = randomUUID();
  const token = `sess_${randomUUID().replace(/-/g, "")}`;
  await query(
    `INSERT INTO sessions (id, user_id, session_token, expires_at)
     VALUES (:id, :userId, :token, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 7 DAY))`,
    { id, userId, token }
  );
  return token;
}

export function getTokenFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }
  const token = auth.slice("Bearer ".length).trim();
  return token || null;
}

export async function deleteSessionByToken(token: string) {
  await query(`DELETE FROM sessions WHERE session_token = :token`, { token });
}
