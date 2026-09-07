import { clearAuthToken, getAuthToken } from "@/lib/api/token";
import type { AuthUser } from "../types";

const USER_KEY = "ultimate-prompts:auth-user";

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (
      typeof parsed?.id === "string" &&
      typeof parsed?.name === "string" &&
      (parsed.role === "free" || parsed.role === "admin")
    ) {
      return { id: parsed.id, name: parsed.name, role: parsed.role };
    }
  } catch {
    return null;
  }

  return null;
}

export function setStoredAuthUser(user: AuthUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  clearAuthToken();
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(USER_KEY);
}

export function hasAuthSession() {
  return Boolean(getAuthToken() && getStoredAuthUser());
}
