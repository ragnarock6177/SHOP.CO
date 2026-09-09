import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { AddressType } from "@prisma/client";

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
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: { role: { select: { id: true, name: true, description: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    return user;
  }

  static async updateUserProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
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
