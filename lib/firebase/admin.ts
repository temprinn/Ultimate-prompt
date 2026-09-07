import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function loadServiceAccount(): ServiceAccount {
  const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON?.trim();
  if (credentialsJson) {
    const parsed = JSON.parse(credentialsJson) as ServiceAccount & {
      private_key?: string;
    };
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  const credentialsPath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;
  if (!credentialsPath) {
    throw new Error(
      "Missing FIREBASE_ADMIN_CREDENTIALS_JSON or FIREBASE_ADMIN_CREDENTIALS_PATH"
    );
  }

  const absolutePath = resolve(process.cwd(), credentialsPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Firebase Admin credentials not found: ${absolutePath}`);
  }

  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as ServiceAccount;
}

let app: App | undefined;
let auth: Auth | undefined;

export function getFirebaseAdminApp() {
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert(loadServiceAccount()),
      });
  }
  return app;
}

export function getFirebaseAdminAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseAdminApp());
  }
  return auth;
}

export function verifyFirebaseIdToken(idToken: string) {
  return getFirebaseAdminAuth().verifyIdToken(idToken);
}
