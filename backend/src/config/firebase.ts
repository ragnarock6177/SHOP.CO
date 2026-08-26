import { env } from "./env.js";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let firebaseApp: App | null = null;

export const initFirebase = (): App | null => {
  if (firebaseApp) return firebaseApp;

  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  let privateKey = env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  const isPlaceholder =
    privateKey.includes("YOUR_PRIVATE_KEY_HERE") ||
    projectId === "your-firebase-project-id" ||
    clientEmail.includes("firebase-adminsdk-xxx");

  if (isPlaceholder) {
    return null;
  }

  privateKey = privateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      return firebaseApp;
    }

    firebaseApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return firebaseApp;
  } catch (error: any) {
    console.warn(`⚠️ Firebase Admin SDK initialization skipped: ${error?.message || error}`);
    return null;
  }
};

export const getFirebaseAuth = (): Auth => {
  const app = initFirebase();
  if (!app) {
    throw new Error("Firebase Admin SDK is not initialized.");
  }
  return getAuth(app);
};

export { firebaseApp };

