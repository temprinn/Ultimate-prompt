import axios from "axios";
import { getGoogleOAuthConfig } from "./google-config";

export type GoogleTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

export type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

export function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();

  return axios
    .post<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )
    .then((response) => response.data);
}

export function fetchGoogleUserInfo(accessToken: string) {
  return axios
    .get<GoogleUserInfo>("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => response.data);
}
