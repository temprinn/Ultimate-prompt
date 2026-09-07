import { apiClient } from "@/lib/api/client";
import { setAuthToken } from "@/lib/api/token";
import type { ApiSuccess } from "@/lib/api/types";
import { setStoredAuthUser } from "@/features/auth/lib/session-storage";
import type { AuthUser } from "@/features/auth/types";

export type DevLoginRole = "free" | "admin";

export type AuthUserDto = {
  id: string;
  email: string | null;
  name: string;
  role: DevLoginRole;
};

export type DevLoginResult = {
  token: string;
  user: AuthUserDto;
  authorization: string;
};

function toAuthUser(user: AuthUserDto): AuthUser {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

export function fetchMe() {
  return apiClient
    .get<ApiSuccess<AuthUserDto>>("/api/auth/me")
    .then((response) => toAuthUser(response.data.data));
}

export function applySession(token: string) {
  setAuthToken(token);
  return fetchMe().then((user) => {
    setStoredAuthUser(user);
    return user;
  });
}

export function exchangeFirebaseIdToken(idToken: string) {
  return apiClient
    .post<ApiSuccess<DevLoginResult & { provider?: string }>>(
      "/api/auth/firebase",
      { idToken }
    )
    .then((response) => {
      const data = response.data.data;
      const user = toAuthUser(data.user);
      setAuthToken(data.token);
      setStoredAuthUser(user);
      return { ...data, user };
    });
}

export function logoutRequest() {
  return apiClient.post<ApiSuccess<{ message: string }>>("/api/auth/logout");
}

export function devLogin(role: DevLoginRole = "free") {
  return apiClient
    .post<ApiSuccess<DevLoginResult>>("/api/auth/dev-login", { role })
    .then((response) => {
      const data = response.data.data;
      const user = toAuthUser(data.user);
      setAuthToken(data.token);
      setStoredAuthUser(user);
      return { ...data, user };
    });
}
