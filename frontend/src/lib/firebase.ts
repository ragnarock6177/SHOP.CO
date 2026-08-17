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
 * Initiates Google Sign-In with Firebase popup and returns the Firebase ID Token.
 */
export async function signInWithGoogleFirebase(): Promise<string> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google Sign-In popup was closed before completing.");
    }
    if (error.code === "auth/cancelled-popup-request") {
      throw new Error("Google Sign-In request was cancelled.");
    }
    throw new Error(error.message || "Google Sign-In failed.");
  }
}

/**
 * Sets up reCAPTCHA verifier for Phone Auth.
 */
export function initRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA can only be initialized in browser.");
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
    if (error.code === "auth/invalid-phone-number") {
      throw new Error("Invalid mobile phone number format.");
    }
    if (error.code === "auth/too-many-requests") {
      throw new Error("Too many SMS attempts. Please wait a few minutes before trying again.");
    }
    throw new Error(error.message || "Failed to send SMS OTP.");
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
    if (error.code === "auth/invalid-verification-code") {
      throw new Error("Incorrect 6-digit OTP code. Please check and re-enter.");
    }
    if (error.code === "auth/code-expired") {
      throw new Error("OTP code has expired. Please click 'Resend OTP'.");
    }
    throw new Error(error.message || "OTP verification failed.");
  }
}
