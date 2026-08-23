import { env } from "./env.js";

let firebaseApp: any = null;

export const initFirebase = (): any => {
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
    // Dynamic import to prevent CommonJS/ESM bundler collision on Vercel Serverless
    const { initializeApp, cert, getApps } = require("firebase-admin/app");
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

export const getFirebaseAuth = (): any => {
  const app = initFirebase();
  if (!app) {
    throw new Error("Firebase Admin SDK is not initialized.");
  }
  const { getAuth } = require("firebase-admin/auth");
  return getAuth(app);
};

export { firebaseApp };
