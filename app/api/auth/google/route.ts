import { NextResponse } from "next/server";
import { buildGoogleAuthorizeUrl } from "@/lib/auth/google-config";
import {
  OAUTH_STATE_COOKIE,
  createOAuthState,
  oauthStateCookieOptions,
} from "@/lib/auth/oauth-state";

export async function GET() {
  try {
    const state = createOAuthState();
    const authorizeUrl = buildGoogleAuthorizeUrl(state);
    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions());
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google OAuth config error";
    return NextResponse.json(
      { ok: false, error: { message, code: "GOOGLE_OAUTH_CONFIG" } },
      { status: 500 }
    );
  }
}
