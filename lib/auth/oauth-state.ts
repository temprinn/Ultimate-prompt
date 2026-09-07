import { randomBytes } from "crypto";

export const OAUTH_STATE_COOKIE = "ultimate-prompts-oauth-state";

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export function oauthStateCookieOptions(maxAgeSeconds = 600) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
