import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { env } from "./env.js";

let firebaseApp: App | null = null;

export const initFirebase = (): App | null => {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0]!;
    return firebaseApp;
  }

  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  let privateKey = env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "⚠️ Firebase Admin SDK environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are missing. Firebase token verification will fail unless configured.",
    );
    return null;
  }

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  try {
    firebaseApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
    return firebaseApp;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
};

export const getFirebaseAuth = (): Auth => {
  const existingApps = getApps();
  let app: App | null = existingApps.length > 0 ? existingApps[0]! : null;
  if (!app) {
    app = initFirebase();
  }
  if (!app) {
    throw new Error(
      "Firebase Admin SDK is not initialized. Check your environment variables.",
    );
  }
  return getAuth(app);
};

initFirebase();
