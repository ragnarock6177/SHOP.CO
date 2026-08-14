import { getFirebaseAuth } from "../config/firebase.js";
import { BadRequestError, UnauthorizedError } from "../utils/apiError.js";

export interface VerifiedPhoneData {
  uid: string;
  phoneNumber: string;
}

export interface VerifiedGoogleData {
  uid: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  emailVerified: boolean;
}

export class FirebaseService {
  /**
   * Verifies Firebase ID Token for Phone OTP authentication.
   * Ensures the provider is phone.
   */
  public static async verifyPhoneToken(
    firebaseToken: string,
  ): Promise<VerifiedPhoneData> {
    try {
      const auth = getFirebaseAuth();
      const decodedToken = await auth.verifyIdToken(firebaseToken);

      const signInProvider = decodedToken.firebase?.sign_in_provider;
      if (signInProvider !== "phone") {
        throw new BadRequestError(
          `Invalid authentication provider. Expected 'phone', but got '${signInProvider}'.`,
        );
      }

      const phoneNumber = decodedToken.phone_number;
      if (!phoneNumber) {
        throw new BadRequestError("Phone number not found in Firebase token.");
      }

      return {
        uid: decodedToken.uid,
        phoneNumber,
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new UnauthorizedError(
        `Firebase phone token verification failed: ${error.message}`,
      );
    }
  }

  /**
   * Verifies Firebase ID Token for Google login.
   * Ensures the provider is Google.
   */
  public static async verifyGoogleToken(
    firebaseToken: string,
  ): Promise<VerifiedGoogleData> {
    try {
      const auth = getFirebaseAuth();
      const decodedToken = await auth.verifyIdToken(firebaseToken);

      const signInProvider = decodedToken.firebase?.sign_in_provider;
      if (signInProvider !== "google.com") {
        throw new BadRequestError(
          `Invalid authentication provider. Expected 'google.com', but got '${signInProvider}'.`,
        );
      }

      const email = decodedToken.email;
      if (!email) {
        throw new BadRequestError(
          "Email address not found in Google Firebase token.",
        );
      }

      let firstName: string | undefined;
      let lastName: string | undefined;

      if (decodedToken.name) {
        const nameParts = decodedToken.name.trim().split(" ");
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      }

      return {
        uid: decodedToken.uid,
        email,
        name: decodedToken.name,
        firstName,
        lastName,
        picture: decodedToken.picture,
        emailVerified: decodedToken.email_verified ?? true,
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new UnauthorizedError(
        `Firebase Google token verification failed: ${error.message}`,
      );
    }
  }
}
