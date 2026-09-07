import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/auth/google-config";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
} from "@/lib/auth/google-oauth";
import { upsertGoogleUser } from "@/lib/auth/google-user";
import {
  OAUTH_STATE_COOKIE,
  oauthStateCookieOptions,
} from "@/lib/auth/oauth-state";
import { createSession } from "@/lib/auth/session";
import { getApiErrorMessage } from "@/lib/api/error";

function redirectWithClearState(url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    ...oauthStateCookieOptions(0),
    maxAge: 0,
  });
  return response;
}

function loginErrorUrl(appUrl: string, message: string) {
  const url = new URL("/login", appUrl);
  url.searchParams.set("error", message);
  return url.toString();
}

export async function GET(request: Request) {
  let appUrl = process.env.APP_URL ?? "http://localhost:3002";

  try {
    ({ appUrl } = getGoogleOAuthConfig());
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      return redirectWithClearState(
        loginErrorUrl(appUrl, "ยกเลิกหรือปฏิเสธการเข้าสู่ระบบด้วย Google")
      );
    }

    if (!code || !state) {
      return redirectWithClearState(
        loginErrorUrl(appUrl, "ไม่พบรหัสยืนยันจาก Google")
      );
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
    if (!savedState || savedState !== state) {
      return redirectWithClearState(
        loginErrorUrl(appUrl, "สถานะ OAuth ไม่ถูกต้อง กรุณาลองใหม่")
      );
    }

    const tokens = await exchangeGoogleCode(code);
    const profile = await fetchGoogleUserInfo(tokens.access_token);
    const user = await upsertGoogleUser(profile, tokens);
    const token = await createSession(user.id);

    const successUrl = new URL("/auth/callback", appUrl);
    successUrl.searchParams.set("token", token);

    return redirectWithClearState(successUrl.toString());
  } catch (error: unknown) {
    return redirectWithClearState(
      loginErrorUrl(appUrl, getApiErrorMessage(error, "เข้าสู่ระบบด้วย Google ไม่สำเร็จ"))
    );
  }
}
