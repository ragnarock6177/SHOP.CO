import { prisma } from "../config/database.js";
import { UserStatus } from "@prisma/client";
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
  public static sanitizeUser(user: any): SanitizedUser {
    const roles: string[] =
      user.userRoles?.map((ur: any) => ur.role?.name).filter(Boolean) || ["CUSTOMER"];

    return {
      id: user.id,
      firebaseUid: user.firebaseUid || null,
      email: user.email || null,
      phone: user.phone || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImage: user.profileImage || null,
      isEmailVerified: Boolean(user.emailVerifiedAt),
      isPhoneVerified: Boolean(user.phoneVerifiedAt),
      roles,
      status: user.status,
      lastLoginAt: user.lastLoginAt || null,
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
    phone?: string;
    firebaseToken?: string;
  }): Promise<AuthResponseData> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError("A user with this email address already exists.");
    }

    let firebaseUid: string | null = null;
    if (input.firebaseToken) {
      try {
        const phoneData = await FirebaseService.verifyPhoneToken(input.firebaseToken);
        firebaseUid = phoneData.uid;
      } catch (err) {
        console.warn("Firebase phone token verification skipped/optional:", err);
      }
    }

    const hashedPassword = await hashPassword(input.password);
    const customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone || null,
        firebaseUid,
        phoneVerifiedAt: input.phone ? new Date() : null,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date(),
        ...(customerRole
          ? {
              userRoles: {
                create: { roleId: customerRole.id },
              },
            }
          : {}),
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    const sanitized = this.sanitizeUser(user);
    const accessToken = JwtService.generateAccessToken({ id: user.id, roles: sanitized.roles });

    return {
      user: sanitized,
      accessToken,
    };
  }

  /**
   * Email/Password Login.
   */
  public static async login(input: EmailLoginInput): Promise<AuthResponseData> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        userRoles: { include: { role: true } },
      },
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
        "This account is registered via Google/Firebase. Please sign in with Google"
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
      include: {
        userRoles: { include: { role: true } },
      },
    });

    const sanitized = this.sanitizeUser(updatedUser);
    const accessToken = JwtService.generateAccessToken({ id: updatedUser.id, roles: sanitized.roles });

    return {
      user: sanitized,
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
        OR: [{ firebaseUid: uid }, { phone: phoneNumber }],
      },
      include: {
        userRoles: { include: { role: true } },
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
          phone: user.phone || phoneNumber,
          phoneVerifiedAt: user.phoneVerifiedAt || new Date(),
          lastLoginAt: new Date(),
        },
        include: {
          userRoles: { include: { role: true } },
        },
      });
    } else {
      const customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
      const dummyEmail = `${uid}@phone.firebase`;

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: dummyEmail,
          phone: phoneNumber,
          phoneVerifiedAt: new Date(),
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
          ...(customerRole
            ? {
                userRoles: {
                  create: { roleId: customerRole.id },
                },
              }
            : {}),
        },
        include: {
          userRoles: { include: { role: true } },
        },
      });
    }

    const sanitized = this.sanitizeUser(user);
    const accessToken = JwtService.generateAccessToken({ id: user.id, roles: sanitized.roles });

    return {
      user: sanitized,
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
      include: {
        userRoles: { include: { role: true } },
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
          emailVerifiedAt: emailVerified ? (user.emailVerifiedAt || new Date()) : user.emailVerifiedAt,
          lastLoginAt: new Date(),
        },
        include: {
          userRoles: { include: { role: true } },
        },
      });
    } else {
      const customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: normalizedEmail,
          firstName: firstName || null,
          lastName: lastName || null,
          profileImage: picture || null,
          emailVerifiedAt: emailVerified ? new Date() : null,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
          ...(customerRole
            ? {
                userRoles: {
                  create: { roleId: customerRole.id },
                },
              }
            : {}),
        },
        include: {
          userRoles: { include: { role: true } },
        },
      });
    }

    const sanitized = this.sanitizeUser(user);
    const accessToken = JwtService.generateAccessToken({ id: user.id, roles: sanitized.roles });

    return {
      user: sanitized,
      accessToken,
    };
  }

  /**
   * Fetches current authenticated user profile by ID.
   */
  public static async getUserProfile(userId: string): Promise<SanitizedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError("Account is disabled or suspended.");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Checks if user exists by email, phone, or identifier.
   */
  public static async checkUser(
    input: CheckUserInput
  ): Promise<CheckUserResponseData> {
    const { email, phone, phoneNumber, identifier } = input;
    const targetPhone = phone || phoneNumber;

    const OR: Array<{ email?: string; phone?: string }> = [];

    if (email) {
      OR.push({ email: email.toLowerCase().trim() });
    }
    if (targetPhone) {
      OR.push({ phone: targetPhone.trim() });
    }
    if (identifier) {
      const trimmed = identifier.trim();
      if (trimmed.includes("@")) {
        OR.push({ email: trimmed.toLowerCase() });
      } else {
        OR.push({ phone: trimmed });
      }
    }

    if (OR.length === 0) {
      throw new BadRequestError(
        "At least one of email, phone, phoneNumber, or identifier must be provided."
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR,
      },
      select: {
        id: true,
        passwordHash: true,
        firebaseUid: true,
      },
    });

    if (!user) {
      return {
        isRegistered: false,
      };
    }

    const provider = user.passwordHash ? "EMAIL" : "GOOGLE";

    if (!user.passwordHash && user.firebaseUid) {
      // User is registered via Google/Firebase
      return {
        isRegistered: true,
        authProvider: "GOOGLE",
      };
    }

    return {
      isRegistered: true,
      authProvider: provider,
    };
  }
}
