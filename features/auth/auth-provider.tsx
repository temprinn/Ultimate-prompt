"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api/token";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  clearAuthSession,
  setStoredAuthUser,
} from "@/features/auth/lib/session-storage";
import {
  applySession,
  exchangeFirebaseIdToken,
  fetchMe,
  logoutRequest,
} from "./services/auth-api";
import {
  clearPendingFirebaseProvider,
  completeFirebaseRedirect,
  getPendingFirebaseProvider,
  resetFirebaseRedirectCompletion,
  signInWithFirebaseProvider,
  signOutFirebase,
  type FirebaseLoginProvider,
} from "./services/firebase-auth";
import type { AuthUser } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  isGuest: boolean;
  isReady: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: () => Promise<void>;
  loginWithProvider: (provider: FirebaseLoginProvider) => Promise<void>;
  completeLogin: (token: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let authBootPromise: Promise<AuthUser | null> | null = null;

function resetAuthBoot() {
  authBootPromise = null;
}

function bootstrapAuthSession(): Promise<AuthUser | null> {
  if (!authBootPromise) {
    authBootPromise = (async () => {
      try {
        const idToken = await completeFirebaseRedirect();
        if (idToken) {
          const data = await exchangeFirebaseIdToken(idToken);
          return data.user;
        }
      } catch (error) {
        clearPendingFirebaseProvider();
        throw error;
      }

      const token = getAuthToken();
      if (!token) {
        clearAuthSession();
        return null;
      }

      try {
        const nextUser = await fetchMe();
        setStoredAuthUser(nextUser);
        return nextUser;
      } catch {
        clearAuthSession();
        return null;
      }
    })();
  }

  return authBootPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hadPendingRedirect = Boolean(getPendingFirebaseProvider());

    if (hadPendingRedirect) {
      setIsLoggingIn(true);
    }

    bootstrapAuthSession()
      .then((nextUser) => {
        if (cancelled) {
          return;
        }
        setUser(nextUser);
        if (nextUser) {
          setAuthError(null);
        } else if (hadPendingRedirect) {
          setAuthError(
            "เข้าสู่ระบบไม่สำเร็จหลัง redirect — ลองกด login อีกครั้ง"
          );
        }
      })
      .catch((error: unknown) => {
        clearPendingFirebaseProvider();
        if (!cancelled) {
          setAuthError(getApiErrorMessage(error, "เข้าสู่ระบบไม่สำเร็จ"));
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
          setIsLoggingIn(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithProvider = useCallback(
    async (provider: FirebaseLoginProvider) => {
      setAuthError(null);
      setIsLoggingIn(true);
      try {
        const idToken = await signInWithFirebaseProvider(provider);
        if (!idToken) {
          return;
        }
        const data = await exchangeFirebaseIdToken(idToken);
        setUser(data.user);
        setAuthError(null);
      } catch (error: unknown) {
        clearPendingFirebaseProvider();
        setAuthError(getApiErrorMessage(error, "เข้าสู่ระบบไม่สำเร็จ"));
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    []
  );

  const login = useCallback(async () => {
    await loginWithProvider("google");
  }, [loginWithProvider]);

  const completeLogin = useCallback(async (token: string) => {
    setIsLoggingIn(true);
    try {
      const nextUser = await applySession(token);
      setUser(nextUser);
      setAuthError(null);
      return nextUser;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => undefined);
    await signOutFirebase();
    clearAuthSession();
    clearPendingFirebaseProvider();
    resetFirebaseRedirectCompletion();
    resetAuthBoot();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGuest: user === null,
      isReady,
      isLoggingIn,
      authError,
      clearAuthError,
      login,
      loginWithProvider,
      completeLogin,
      logout,
    }),
    [
      user,
      isReady,
      isLoggingIn,
      authError,
      clearAuthError,
      login,
      loginWithProvider,
      completeLogin,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
