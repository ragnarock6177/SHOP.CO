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

  // Check for default / placeholder values
  const isPlaceholder =
    privateKey.includes("YOUR_PRIVATE_KEY_HERE") ||
    projectId === "your-firebase-project-id" ||
    clientEmail.includes("firebase-adminsdk-xxx");

  if (isPlaceholder) {
    console.warn(
      "⚠️ Firebase Admin SDK is using placeholder credentials in .env. Firebase token verification will be disabled until valid credentials are added.",
    );
    return null;
  }

  // Sanitize and format private key (strip wrapping quotes and convert escaped newlines)
  privateKey = privateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

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
  } catch (error: any) {
    console.warn(
      `⚠️ Failed to initialize Firebase Admin SDK: ${error?.message || error}`,
    );
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
