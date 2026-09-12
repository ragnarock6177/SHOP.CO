import prisma from "../lib/prisma.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../utils/errors.js";
import { AddressType } from "@prisma/client";
import { comparePassword, hashPassword } from "../utils/password.util.js";

type AddressInput = {
  type?: AddressType;
  label?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  isDefault?: boolean;
};

type UpdateProfileInput = {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  smsDeliveryUpdates?: boolean;
  promotionalEmails?: boolean;
  orderEmailUpdates?: boolean;
};

function formatUserProfile(user: {
  id: string;
  firebaseUid: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  smsDeliveryUpdates: boolean;
  promotionalEmails: boolean;
  orderEmailUpdates: boolean;
  status: string;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string | null;
  userRoles?: {
    role: { id: string; name: string; description: string | null };
  }[];
}) {
  const { passwordHash, userRoles, dateOfBirth, ...rest } = user;

  return {
    ...rest,
    dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : null,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    hasPassword: Boolean(passwordHash),
    roles: userRoles?.map((entry) => entry.role.name) ?? [],
  };
}

export class UserService {
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        gender: true,
        dateOfBirth: true,
        smsDeliveryUpdates: true,
        promotionalEmails: true,
        orderEmailUpdates: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
        userRoles: {
          select: { role: { select: { id: true, name: true, description: true } } },
        },
      } as any,
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    return formatUserProfile(user as any);
  }

  static async updateUserProfile(userId: string, data: UpdateProfileInput) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00.000Z`) : null;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        gender: true,
        dateOfBirth: true,
        smsDeliveryUpdates: true,
        promotionalEmails: true,
        orderEmailUpdates: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
        userRoles: {
          select: { role: { select: { id: true, name: true, description: true } } },
        },
      } as any,
    });

    return formatUserProfile(user as any);
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    if (!user.passwordHash) {
      throw new ValidationError("Password change is not available for social login accounts.");
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: "Password updated successfully." };
  }

  static async getUserAddresses(userId: string) {
    return prisma.userAddress.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  private static async clearDefaultAddresses(
    userId: string,
    type: AddressType,
    excludeId?: string,
  ) {
    await prisma.userAddress.updateMany({
      where: {
        userId,
        type,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      data: { isDefault: false },
    });
  }

  static async addUserAddress(userId: string, data: AddressInput & {
    firstName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  }) {
    const type = data.type || AddressType.SHIPPING;
    const existingCount = await prisma.userAddress.count({
      where: { userId, deletedAt: null, type },
    });
    const shouldBeDefault = data.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await this.clearDefaultAddresses(userId, type);
    }

    return prisma.userAddress.create({
      data: {
        ...data,
        type,
        isDefault: shouldBeDefault,
        userId,
      },
    });
  }

  static async updateUserAddress(userId: string, addressId: string, data: AddressInput) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundError("Address record not found or already deleted");
    }

    const type = data.type || address.type;

    if (data.isDefault) {
      await this.clearDefaultAddresses(userId, type, addressId);
    }

    return prisma.userAddress.update({
      where: { id: addressId },
      data: {
        ...data,
        ...(data.isDefault ? { isDefault: true } : {}),
      },
    });
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundError("Address record not found or already deleted");
    }

    await this.clearDefaultAddresses(userId, address.type, addressId);

    return prisma.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  static async softDeleteAddress(userId: string, addressId: string) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundError("Address record not found or already deleted");
    }

    const deleted = await prisma.userAddress.update({
      where: { id: addressId },
      data: { deletedAt: new Date(), isDefault: false },
    });

    if (address.isDefault) {
      const nextDefault = await prisma.userAddress.findFirst({
        where: { userId, deletedAt: null, type: address.type },
        orderBy: { createdAt: "desc" },
      });

      if (nextDefault) {
        await prisma.userAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return deleted;
  }
}
