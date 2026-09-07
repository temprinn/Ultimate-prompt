function requiredEnv(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`Missing env: ${name}`);
  }
  return value.trim();
}

export function getGoogleOAuthConfig() {
  const clientId = requiredEnv(
    "GOOGLE_CLIENT_ID",
    process.env.GOOGLE_CLIENT_ID
  );
  const clientSecret = requiredEnv(
    "GOOGLE_CLIENT_SECRET",
    process.env.GOOGLE_CLIENT_SECRET
  );
  const redirectUri = requiredEnv(
    "GOOGLE_REDIRECT_URI",
    process.env.GOOGLE_REDIRECT_URI ?? process.env.GOOGLE_REDIRECT_URL
  );
  const appUrl = requiredEnv(
    "APP_URL",
    process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL
  );

  return { clientId, clientSecret, redirectUri, appUrl };
}

export function buildGoogleAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);
  return url.toString();
}
