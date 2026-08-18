import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

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

  static async addUserAddress(userId: string, data: any) {
    // If setting as default, clear other default addresses for user
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId, type: data.type },
        data: { isDefault: false },
      });
    }

    return prisma.userAddress.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  static async softDeleteAddress(userId: string, addressId: string) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundError("Address record not found or already deleted");
    }

    return prisma.userAddress.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });
  }
}
