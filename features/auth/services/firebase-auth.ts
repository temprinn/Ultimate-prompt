import {
  browserLocalPersistence,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type AuthProvider,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { getFirebaseAuth } from "@/lib/firebase/client";

export type FirebaseLoginProvider = "google" | "facebook" | "github";

const PENDING_PROVIDER_KEY = "ultimate-prompts:firebase-provider";

async function ensureFirebaseAuthReady() {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  await auth.authStateReady();
  return auth;
}

function createProvider(provider: FirebaseLoginProvider): AuthProvider {
  if (provider === "facebook") {
    const facebook = new FacebookAuthProvider();
    facebook.addScope("email");
    facebook.addScope("public_profile");
    return facebook;
  }
  if (provider === "github") {
    const github = new GithubAuthProvider();
    github.addScope("user:email");
    return github;
  }
  const google = new GoogleAuthProvider();
  google.addScope("email");
  google.addScope("profile");
  return google;
}

function prefersPopupLogin() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(pointer: fine)").matches;
}

function shouldFallbackToRedirect(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return false;
  }
  return (
    error.code === "auth/popup-blocked" ||
    error.code === "auth/cancelled-popup-request"
  );
}

/** Popup when possible; otherwise full-page redirect. Returns idToken for popup, null when redirecting away. */
export async function signInWithFirebaseProvider(
  provider: FirebaseLoginProvider
) {
  resetFirebaseRedirectCompletion();
  const auth = await ensureFirebaseAuthReady();

  if (prefersPopupLogin()) {
    try {
      const result = await signInWithPopup(auth, createProvider(provider));
      clearPendingFirebaseProvider();
      return result.user.getIdToken();
    } catch (error) {
      if (!shouldFallbackToRedirect(error)) {
        clearPendingFirebaseProvider();
        throw error;
      }
    }
  }

  window.localStorage.setItem(PENDING_PROVIDER_KEY, provider);
  await signInWithRedirect(auth, createProvider(provider));
  return null;
}

/** @deprecated Use signInWithFirebaseProvider */
export function startFirebaseRedirect(provider: FirebaseLoginProvider) {
  return signInWithFirebaseProvider(provider);
}

export function getPendingFirebaseProvider() {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem(PENDING_PROVIDER_KEY);
  if (value === "google" || value === "facebook" || value === "github") {
    return value;
  }
  return null;
}

export function clearPendingFirebaseProvider() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(PENDING_PROVIDER_KEY);
}

function waitForFirebaseUser(auth: Auth, timeoutMs = 10000) {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise<User | null>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.clearTimeout(timeoutId);
        unsubscribe();
        resolve(user);
      }
    });
  });
}

/** Returns Firebase ID token when returning from redirect login; otherwise null. */
let redirectCompletionPromise: Promise<string | null> | null = null;

export function resetFirebaseRedirectCompletion() {
  redirectCompletionPromise = null;
}

async function resolveRedirectIdToken() {
  const auth = await ensureFirebaseAuthReady();
  const hadPendingRedirect = getPendingFirebaseProvider() !== null;

  let redirectError: unknown;
  let result = null;

  try {
    result = await getRedirectResult(auth);
  } catch (error) {
    redirectError = error;
  }

  let firebaseUser = result?.user ?? auth.currentUser;

  if (!firebaseUser && hadPendingRedirect) {
    firebaseUser = await waitForFirebaseUser(auth);
  }

  clearPendingFirebaseProvider();

  if (redirectError && !firebaseUser) {
    throw redirectError;
  }

  if (!firebaseUser) {
    return null;
  }

  return firebaseUser.getIdToken();
}

export function completeFirebaseRedirect() {
  if (!redirectCompletionPromise) {
    redirectCompletionPromise = resolveRedirectIdToken();
  }
  return redirectCompletionPromise;
}

export function signOutFirebase() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  try {
    return signOut(getFirebaseAuth()).catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}
