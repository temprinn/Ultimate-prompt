import { randomUUID } from "crypto";
import type { ApiUser } from "@/lib/api/auth";
import { query } from "@/lib/db/pool";
import type { GoogleTokenResponse, GoogleUserInfo } from "./google-oauth";

type LinkedUserRow = ApiUser & { account_id: string };

export async function upsertGoogleUser(
  profile: GoogleUserInfo,
  tokens: GoogleTokenResponse
) {
  if (!profile.sub) {
    throw new Error("Google profile missing sub");
  }

  const email = profile.email?.trim().toLowerCase() || null;
  const name = profile.name?.trim() || email || "Google User";
  const image = profile.picture ?? null;
  const emailVerified =
    profile.email_verified === true || profile.email_verified === "true";
  const expiresAt = tokens.expires_in
    ? Math.floor(Date.now() / 1000) + tokens.expires_in
    : null;

  const existing = await query<LinkedUserRow[]>(
    `SELECT u.id, u.email, u.name, u.role, a.id AS account_id
     FROM auth_accounts a
     INNER JOIN users u ON u.id = a.user_id
     WHERE a.provider = 'google' AND a.provider_account_id = :sub
     LIMIT 1`,
    { sub: profile.sub }
  );

  if (existing[0]) {
    await query(
      `UPDATE auth_accounts
       SET access_token = :accessToken,
           refresh_token = COALESCE(:refreshToken, refresh_token),
           id_token = :idToken,
           token_type = :tokenType,
           scope = :scope,
           expires_at = :expiresAt,
           updated_at = UTC_TIMESTAMP(3)
       WHERE id = :accountId`,
      {
        accountId: existing[0].account_id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        idToken: tokens.id_token ?? null,
        tokenType: tokens.token_type ?? null,
        scope: tokens.scope ?? null,
        expiresAt,
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
       id, user_id, provider, provider_account_id, type,
       access_token, refresh_token, id_token, token_type, scope, expires_at
     ) VALUES (
       :id, :userId, 'google', :sub, 'oidc',
       :accessToken, :refreshToken, :idToken, :tokenType, :scope, :expiresAt
     )`,
    {
      id: randomUUID(),
      userId,
      sub: profile.sub,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      idToken: tokens.id_token ?? null,
      tokenType: tokens.token_type ?? null,
      scope: tokens.scope ?? null,
      expiresAt,
    }
  );

  const user = await query<ApiUser[]>(
    `SELECT id, email, name, role FROM users WHERE id = :userId LIMIT 1`,
    { userId }
  );

  if (!user[0]) {
    throw new Error("Failed to load Google user after upsert");
  }

  return user[0];
}
