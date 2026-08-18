import prisma from "../lib/prisma.js";
import { NotFoundError, UnprocessableEntityError } from "../utils/errors.js";
import { parsePaginationParams, buildPaginationMeta } from "../utils/pagination.js";
import { OrderStatus, InventoryMovementType } from "@prisma/client";

export class AdminService {
  static async createProduct(payload: {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    basePrice: number;
    compareAtPrice?: number;
    currency?: string;
    status?: any;
    categoryIds: string[];
    collectionIds?: string[];
  }) {
    return prisma.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        shortDescription: payload.shortDescription,
        basePrice: payload.basePrice,
        compareAtPrice: payload.compareAtPrice,
        currency: payload.currency || "INR",
        status: payload.status || "ACTIVE",
        productCategories: {
          create: payload.categoryIds.map((catId, index) => ({
            categoryId: catId,
            isPrimary: index === 0,
          })),
        },
        ...(payload.collectionIds
          ? {
              productCollections: {
                create: payload.collectionIds.map((colId) => ({
                  collectionId: colId,
                })),
              },
            }
          : {}),
      },
      include: {
        productCategories: { include: { category: true } },
        productCollections: { include: { collection: true } },
      },
    });
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, changedBy: string, reason?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: {
            oldStatus: order.status,
            newStatus: status,
            changedBy,
            reason: reason || `Status updated to ${status} by admin`,
          },
        },
      },
    });
  }

  static async adjustInventory(variantId: string, quantityChange: number, movementType: InventoryMovementType, adminId: string, notes?: string) {
    let inventory = await prisma.inventory.findFirst({ where: { variantId } });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          variantId,
          quantityOnHand: Math.max(0, quantityChange),
          quantityReserved: 0,
        },
      });
    } else {
      const newOnHand = Math.max(0, inventory.quantityOnHand + quantityChange);
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantityOnHand: newOnHand },
      });
    }

    await prisma.inventoryMovement.create({
      data: {
        variantId,
        movementType,
        quantity: quantityChange,
        createdBy: adminId,
        notes: notes || `Admin manual adjustment by ${adminId}`,
      },
    });

    return inventory;
  }

  static async listAuditLogs(queryPage?: string, queryLimit?: string) {
    const { page, limit, skip } = parsePaginationParams(queryPage, queryLimit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, firstName: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    const meta = buildPaginationMeta(page, limit, total);
    return { data: logs, meta };
  }
}
