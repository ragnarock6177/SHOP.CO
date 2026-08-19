import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { hashPassword } from "../../utils/password.util.js";
import { UserStatus } from "@prisma/client";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/errors.js";

export class AdminUsersService {
  static async getAdminUsers(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "email", "firstName", "lastName", "status"],
      "createdAt"
    );

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (query.status && Object.values(UserStatus).includes(query.status as UserStatus)) {
      where.status = query.status as UserStatus;
    }

    if (query.role) {
      where.userRoles = {
        some: {
          role: {
            name: query.role as string,
          },
        },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          profileImage: true,
          status: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      ...u,
      roles: u.userRoles.map((ur) => ur.role.name),
    }));

    return {
      users: formattedUsers,
      total,
      page,
      limit,
    };
  }

  static async createAdminUser(
    data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      status?: UserStatus;
      roleIds?: string[];
    },
    actingUserRoles: string[]
  ) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError("A user account with this email already exists");
    }

    if (data.roleIds && data.roleIds.length > 0) {
      const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
      if (superAdminRole && data.roleIds.includes(superAdminRole.id)) {
        if (!actingUserRoles.includes("SUPER_ADMIN")) {
          throw new ForbiddenError("Only SUPER_ADMIN users can grant the SUPER_ADMIN role");
        }
      }
    }

    const passwordHash = await hashPassword(data.password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          status: data.status || UserStatus.ACTIVE,
        },
      });

      if (data.roleIds && data.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: data.roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        });
      }

      return user;
    });

    return this.getAdminUserById(newUser.id);
  }

  static async updateAdminUser(
    userId: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      status?: UserStatus;
      roleIds?: string[];
    },
    actingUserRoles: string[]
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("Admin user not found");
    }

    if (data.roleIds && data.roleIds.length > 0) {
      const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
      if (superAdminRole && data.roleIds.includes(superAdminRole.id)) {
        if (!actingUserRoles.includes("SUPER_ADMIN")) {
          throw new ForbiddenError("Only SUPER_ADMIN users can assign the SUPER_ADMIN role");
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          status: data.status,
        },
      });

      if (data.roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId } });
        if (data.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: data.roleIds.map((roleId) => ({
              userId,
              roleId,
            })),
          });
        }
      }
    });

    return this.getAdminUserById(userId);
  }

  static async updateUserStatus(userId: string, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return this.getAdminUserById(updated.id);
  }

  static async getAdminUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundError("User not found");

    return {
      ...user,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }
}
