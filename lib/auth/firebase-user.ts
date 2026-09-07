import { randomUUID } from "crypto";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { ApiUser } from "@/lib/api/auth";
import { query } from "@/lib/db/pool";

type LinkedUserRow = ApiUser & { account_id: string };

export async function upsertFirebaseUser(decoded: DecodedIdToken) {
  const uid = decoded.uid;
  if (!uid) {
    throw new Error("Firebase token missing uid");
  }

  const email = decoded.email?.trim().toLowerCase() || null;
  const name =
    decoded.name?.trim() ||
    email ||
    (decoded.firebase?.sign_in_provider
      ? `User (${decoded.firebase.sign_in_provider})`
      : "Firebase User");
  const image = decoded.picture ?? null;
  const emailVerified = decoded.email_verified === true;
  const signInProvider = decoded.firebase?.sign_in_provider ?? null;

  const existing = await query<LinkedUserRow[]>(
    `SELECT u.id, u.email, u.name, u.role, a.id AS account_id
     FROM auth_accounts a
     INNER JOIN users u ON u.id = a.user_id
     WHERE a.provider = 'firebase' AND a.provider_account_id = :uid
     LIMIT 1`,
    { uid }
  );

  if (existing[0]) {
    await query(
      `UPDATE auth_accounts
       SET session_state = :signInProvider,
           updated_at = UTC_TIMESTAMP(3)
       WHERE id = :accountId`,
      {
        accountId: existing[0].account_id,
        signInProvider,
      }
    );

    await query(
      `UPDATE users
       SET name = :name,
           image = COALESCE(:image, image),
           email = COALESCE(:email, email),
           email_verified_at = CASE
             WHEN :emailVerified = 1 THEN UTC_TIMESTAMP(3)
             ELSE email_verified_at
           END,
           updated_at = UTC_TIMESTAMP(3)
       WHERE id = :userId`,
      {
        userId: existing[0].id,
        name,
        image,
        email,
        emailVerified: emailVerified ? 1 : 0,
      }
    );

    return {
      id: existing[0].id,
      email: email ?? existing[0].email,
      name,
      role: existing[0].role,
    } satisfies ApiUser;
  }

  let userId: string | null = null;

  if (email) {
    const byEmail = await query<ApiUser[]>(
      `SELECT id, email, name, role FROM users WHERE email = :email LIMIT 1`,
      { email }
    );
    userId = byEmail[0]?.id ?? null;
  }

  if (!userId) {
    userId = randomUUID();
    await query(
      `INSERT INTO users (id, email, name, image, role, email_verified_at)
       VALUES (
         :id,
         :email,
         :name,
         :image,
         'free',
         CASE WHEN :emailVerified = 1 THEN UTC_TIMESTAMP(3) ELSE NULL END
       )`,
      {
        id: userId,
        email,
        name,
        image,
        emailVerified: emailVerified ? 1 : 0,
      }
    );
  } else {
    await query(
      `UPDATE users
       SET name = :name,
           image = COALESCE(:image, image),
           email_verified_at = CASE
             WHEN :emailVerified = 1 THEN UTC_TIMESTAMP(3)
             ELSE email_verified_at
           END,
           updated_at = UTC_TIMESTAMP(3)
       WHERE id = :userId`,
      {
        userId,
        name,
        image,
        emailVerified: emailVerified ? 1 : 0,
      }
    );
  }

  await query(
    `INSERT INTO auth_accounts (
       id, user_id, provider, provider_account_id, type, session_state
     ) VALUES (
       :id, :userId, 'firebase', :uid, 'oidc', :signInProvider
     )`,
    {
      id: randomUUID(),
      userId,
      uid,
      signInProvider,
    }
  );

  const user = await query<ApiUser[]>(
    `SELECT id, email, name, role FROM users WHERE id = :userId LIMIT 1`,
    { userId }
  );

  if (!user[0]) {
    throw new Error("Failed to load Firebase user after upsert");
  }

  return user[0];
}
