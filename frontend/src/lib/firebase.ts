import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAhPESvztnQg9HyGH7PmaQN-YQPIkE3_3k",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "airave-8a552.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "airave-8a552",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "airave-8a552.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "584796247307",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:584796247307:web:c5763c50cc3816cfc73e0e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NCGN2QMB5R",
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Helper to extract clean non-technical user friendly error messages from Firebase SDK errors.
 */
/**
 * Helper to map all Firebase Auth SDK errors into short, clean app-style error messages.
 */
function parseFirebaseError(error: any, defaultMsg: string): string {
  if (!error) return defaultMsg;
  const code = error.code || "";
  const message = error.message || "";

  switch (code) {
    case "auth/popup-closed-by-user":
      return "Sign-in window closed";
    case "auth/cancelled-popup-request":
      return "Sign-in cancelled";
    case "auth/invalid-phone-number":
      return "Invalid mobile number";
    case "auth/missing-phone-number":
      return "Mobile number required";
    case "auth/too-many-requests":
    case "auth/quota-exceeded":
      return "Too many attempts. Try later";
    case "auth/invalid-verification-code":
      return "Incorrect OTP code";
    case "auth/code-expired":
      return "OTP code expired. Please resend";
    case "auth/missing-verification-code":
      return "Please enter 6-digit OTP";
    case "auth/credential-already-in-use":
    case "auth/email-already-in-use":
    case "auth/account-exists-with-different-credential":
      return "Account already exists. Please log in";
    case "auth/user-disabled":
      return "Account disabled";
    case "auth/user-not-found":
      return "Account not found";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect password";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/network-request-failed":
      return "Network error. Check connection";
    case "auth/captcha-check-failed":
      return "Verification check failed. Try again";
    case "auth/app-not-authorized":
      return "Domain not authorized for sign-in";
    default:
      break;
  }

  if (message.includes("network") || message.includes("Failed to fetch")) {
    return "Network error. Check connection";
  }

  // Strip raw Firebase syntax e.g. "Firebase: Error (auth/invalid-email)."
  const cleaned = message
    .replace(/^Firebase:\s*Error\s*\(auth\/[^)]+\)\.?\s*/i, "")
    .replace(/^Firebase:\s*/i, "")
    .replace(/\(auth\/[^)]+\)/i, "");

  return cleaned || defaultMsg;
}

/**
 * Initiates Google Sign-In with Firebase popup and returns the Firebase ID Token.
 */
export async function signInWithGoogleFirebase(): Promise<string> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error: any) {
    throw new Error(parseFirebaseError(error, "Google sign-in failed. Please try again."));
  }
}

/**
 * Sets up reCAPTCHA verifier for Phone Auth.
 */
export function initRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("Verification can only be performed in browser.");
  }

  // Clear existing reCAPTCHA if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {}
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends Phone OTP using Firebase Auth.
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error: any) {
    throw new Error(parseFirebaseError(error, "Failed to send SMS verification code. Please check your mobile number."));
  }
}

/**
 * Verifies entered OTP code with Firebase ConfirmationResult and retrieves Firebase ID Token.
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<string> {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error: any) {
    throw new Error(parseFirebaseError(error, "Verification failed. Please check the 6-digit code and try again."));
  }
}
