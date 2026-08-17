import { prisma } from "../config/database.js";
import { AuthProvider, Role, User, UserStatus } from "@prisma/client";
import {
  AuthResponseData,
  CheckUserInput,
  CheckUserResponseData,
  EmailLoginInput,
  SanitizedUser,
  UnifiedRegisterInput,
} from "../types/auth.types.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { FirebaseService } from "./firebase.service.js";
import { JwtService } from "./jwt.service.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/apiError.js";

export class AuthService {
  /**
   * Sanitizes a User model instance for safe external exposure.
   */
  public static sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Unified register / authentication entrypoint.
   * Handles 'email', 'phone', and 'google' auth flows seamlessly.
   */
  public static async register(
    input: UnifiedRegisterInput,
  ): Promise<AuthResponseData> {
    switch (input.type) {
      case "email":
        return this.handleEmailRegistration(input);
      case "phone":
        return this.handlePhoneAuth(input.firebaseToken);
      case "google":
        return this.handleGoogleAuth(input.firebaseToken);
      default:
        throw new BadRequestError(
          'Invalid authentication type. Must be "email", "phone", or "google".',
        );
    }
  }

  /**
   * Email/Password Registration.
   */
  private static async handleEmailRegistration(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponseData> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError("A user with this email address already exists.");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        authProvider: AuthProvider.EMAIL,
        isEmailVerified: false,
        isPhoneVerified: false,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date(),
      },
    });

    const accessToken = JwtService.generateAccessToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Email/Password Login.
   */
  public static async login(input: EmailLoginInput): Promise<AuthResponseData> {
    if (input.type !== "email") {
      throw new BadRequestError('Login endpoint requires type: "email"');
    }

    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError(
        "The email address or password you entered is incorrect. Please double-check and try again."
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError(
        "Your AIRAVÉ account is temporarily suspended. Please contact customer support for assistance."
      );
    }

    if (!user.passwordHash) {
      throw new BadRequestError(
        "This account was created via social sign-in. Please sign in using your Google account or Phone number."
      );
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "The email address or password you entered is incorrect. Please double-check and try again."
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = JwtService.generateAccessToken(updatedUser);

    return {
      user: this.sanitizeUser(updatedUser),
      accessToken,
    };
  }

  /**
   * Phone Firebase Authentication flow.
   */
  private static async handlePhoneAuth(
    firebaseToken: string,
  ): Promise<AuthResponseData> {
    const verifiedPhoneData =
      await FirebaseService.verifyPhoneToken(firebaseToken);
    const { uid, phoneNumber } = verifiedPhoneData;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { phoneNumber }],
      },
    });

    if (user) {
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenError("Account is disabled or suspended.");
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: user.firebaseUid || uid,
          phoneNumber: user.phoneNumber || phoneNumber,
          isPhoneVerified: true,
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          phoneNumber,
          authProvider: AuthProvider.PHONE,
          isPhoneVerified: true,
          isEmailVerified: false,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
        },
      });
    }

    const accessToken = JwtService.generateAccessToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Google Firebase Authentication flow.
   */
  private static async handleGoogleAuth(
    firebaseToken: string,
  ): Promise<AuthResponseData> {
    const googleData = await FirebaseService.verifyGoogleToken(firebaseToken);
    const { uid, email, firstName, lastName, picture, emailVerified } =
      googleData;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email: normalizedEmail }],
      },
    });

    if (user) {
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenError("Account is disabled or suspended.");
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: user.firebaseUid || uid,
          firstName: user.firstName || firstName || null,
          lastName: user.lastName || lastName || null,
          profileImage: user.profileImage || picture || null,
          isEmailVerified: emailVerified ?? user.isEmailVerified,
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: normalizedEmail,
          firstName: firstName || null,
          lastName: lastName || null,
          profileImage: picture || null,
          authProvider: AuthProvider.GOOGLE,
          isEmailVerified: emailVerified,
          isPhoneVerified: false,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
        },
      });
    }

    const accessToken = JwtService.generateAccessToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Fetches current authenticated user profile by ID.
   */
  public static async getUserProfile(userId: string): Promise<SanitizedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError("Account is disabled or suspended.");
    }

    return this.sanitizeUser(user);
  }

  public static async checkUser(
    input: CheckUserInput
  ): Promise<CheckUserResponseData> {
    const { email, phoneNumber, identifier } = input;

    const OR: Array<{ email?: string; phoneNumber?: string }> = [];

    if (email) {
      OR.push({ email });
    }
    if (phoneNumber) {
      OR.push({ phoneNumber });
    }
    if (identifier) {
      OR.push({ email: identifier });
      OR.push({ phoneNumber: identifier });
    }

    if (OR.length === 0) {
      throw new BadRequestError(
        "At least one of email, phoneNumber, or identifier must be provided."
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR,
      },
      select: {
        id: true,
        authProvider: true,
      },
    });

    if (!user) {
      return {
        isRegistered: false,
      };
    }

    return {
      isRegistered: true,
      authProvider: user.authProvider,
    };
  }
}



