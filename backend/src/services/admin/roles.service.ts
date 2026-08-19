import prisma from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

export class RolesService {
  static async getRoles() {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        rolePermissions: {
          select: {
            permission: {
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

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      permissions: r.rolePermissions.map((rp) => rp.permission),
    }));
  }

  static async getRoleById(id: string) {
    const r = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        rolePermissions: {
          select: {
            permission: {
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

    if (!r) throw new NotFoundError("Role not found");

    return {
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      permissions: r.rolePermissions.map((rp) => rp.permission),
    };
  }

  static async getPermissions() {
    return prisma.permission.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });
  }

  static async createRole(data: { name: string; description?: string; permissionIds?: string[] }) {
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictError("A role with this name already exists");
    }

    const createdRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      if (data.permissionIds && data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }

      return role;
    });

    return this.getRoleById(createdRole.id);
  }

  static async updateRole(
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] }
  ) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    if (data.name && data.name !== role.name) {
      const existing = await prisma.role.findUnique({ where: { name: data.name } });
      if (existing) {
        throw new ConflictError("A role with this name already exists");
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      if (data.permissionIds !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (data.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: data.permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }
    });

    return this.getRoleById(id);
  }
}
