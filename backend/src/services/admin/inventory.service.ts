import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { InventoryMovementType } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

export class AdminInventoryService {
  static async getInventory(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "updatedAt", "quantityOnHand", "quantityReserved", "reorderLevel"],
      "updatedAt"
    );

    const where: any = {};

    if (search) {
      where.variant = {
        OR: [
          { sku: { contains: search, mode: "insensitive" } },
          { barcode: { contains: search, mode: "insensitive" } },
          { product: { name: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              barcode: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    const formatted = inventories.map((inv) => {
      const available = inv.quantityOnHand - inv.quantityReserved;
      return {
        id: inv.id,
        variantId: inv.variantId,
        sku: inv.variant.sku,
        barcode: inv.variant.barcode,
        productName: inv.variant.product.name,
        price: inv.variant.price.toNumber(),
        quantityOnHand: inv.quantityOnHand,
        quantityReserved: inv.quantityReserved,
        availableQuantity: available,
        reorderLevel: inv.reorderLevel,
        isLowStock: available <= inv.reorderLevel,
        isOutOfStock: available <= 0,
        updatedAt: inv.updatedAt,
      };
    });

    return { inventory: formatted, total, page, limit };
  }

  static async adjustInventory(
    data: {
      variantId: string;
      quantityChange: number;
      movementType: InventoryMovementType;
      notes?: string;
    },
    adminUserId: string
  ) {
    return prisma.$transaction(async (tx) => {
      let inventory = await tx.inventory.findUnique({
        where: { variantId: data.variantId },
      });

      if (!inventory) {
        // Auto-create inventory row if missing for variant
        inventory = await tx.inventory.create({
          data: {
            variantId: data.variantId,
            quantityOnHand: 0,
            quantityReserved: 0,
            reorderLevel: 0,
          },
        });
      }

      const newOnHand = inventory.quantityOnHand + data.quantityChange;
      if (newOnHand < 0) {
        throw new ValidationError(
          `Insufficient stock on hand. Current: ${inventory.quantityOnHand}, Attempted adjustment: ${data.quantityChange}`
        );
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantityOnHand: newOnHand,
        },
        include: {
          variant: {
            select: {
              sku: true,
              product: { select: { name: true } },
            },
          },
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          variantId: data.variantId,
          movementType: data.movementType,
          quantity: data.quantityChange,
          notes: data.notes,
          createdBy: adminUserId,
        },
      });

      const available = updatedInventory.quantityOnHand - updatedInventory.quantityReserved;

      return {
        inventory: {
          id: updatedInventory.id,
          variantId: updatedInventory.variantId,
          sku: updatedInventory.variant.sku,
          productName: updatedInventory.variant.product.name,
          quantityOnHand: updatedInventory.quantityOnHand,
          quantityReserved: updatedInventory.quantityReserved,
          availableQuantity: available,
          reorderLevel: updatedInventory.reorderLevel,
        },
        movement,
      };
    });
  }

  static async getInventoryMovements(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "quantity"],
      "createdAt"
    );

    const where: any = {};

    if (query.variantId) {
      where.variantId = query.variantId;
    }

    if (query.movementType && Object.values(InventoryMovementType).includes(query.movementType as InventoryMovementType)) {
      where.movementType = query.movementType as InventoryMovementType;
    }

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          variant: {
            select: {
              sku: true,
              product: { select: { name: true } },
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return { movements, total, page, limit };
  }

  static async getInventoryReservations(query: Record<string, any> = {}) {
    const { page, limit, sortBy, sortOrder, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "expiresAt", "quantity"],
      "createdAt"
    );

    const where: any = {};

    if (query.status === "ACTIVE") {
      where.releasedAt = null;
      where.expiresAt = { gt: new Date() };
    } else if (query.status === "EXPIRED") {
      where.releasedAt = null;
      where.expiresAt = { lte: new Date() };
    } else if (query.status === "RELEASED") {
      where.releasedAt = { not: null };
    }

    if (query.variantId) {
      where.variantId = query.variantId;
    }

    const [reservations, total] = await Promise.all([
      prisma.inventoryReservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              price: true,
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      prisma.inventoryReservation.count({ where }),
    ]);

    const now = new Date();
    const formatted = reservations.map((res) => {
      let status: "ACTIVE" | "EXPIRED" | "RELEASED" = "ACTIVE";
      if (res.releasedAt) {
        status = "RELEASED";
      } else if (res.expiresAt <= now) {
        status = "EXPIRED";
      }

      return {
        id: res.id,
        variantId: res.variantId,
        sku: res.variant.sku,
        productName: res.variant.product.name,
        cartId: res.cartId,
        orderId: res.orderId,
        quantity: res.quantity,
        expiresAt: res.expiresAt,
        releasedAt: res.releasedAt,
        createdAt: res.createdAt,
        status,
      };
    });

    return { reservations: formatted, total, page, limit };
  }

  static async releaseReservationById(reservationId: string, adminUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { id: reservationId },
        include: { variant: { select: { sku: true, product: { select: { name: true } } } } },
      });

      if (!reservation) {
        throw new NotFoundError("Reservation not found");
      }

      if (reservation.releasedAt) {
        throw new ValidationError("Reservation has already been released or fulfilled.");
      }

      // Mark reservation released
      const updatedReservation = await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: { releasedAt: new Date() },
      });

      // Decrement quantityReserved from inventory
      const inventory = await tx.inventory.findUnique({
        where: { variantId: reservation.variantId },
      });

      if (inventory) {
        const newReserved = Math.max(0, inventory.quantityReserved - reservation.quantity);
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantityReserved: newReserved },
        });

        // Record RELEASE movement
        await tx.inventoryMovement.create({
          data: {
            variantId: reservation.variantId,
            movementType: InventoryMovementType.RELEASE,
            quantity: reservation.quantity,
            referenceType: reservation.orderId ? "ORDER" : "CART_RESERVATION",
            referenceId: reservation.orderId || reservation.cartId || undefined,
            notes: `Released hold on ${reservation.variant.sku} (Quantity: ${reservation.quantity})`,
            createdBy: adminUserId || null,
          },
        });
      }

      return updatedReservation;
    });
  }

  static async releaseExpiredReservations() {
    const now = new Date();
    const expiredReservations = await prisma.inventoryReservation.findMany({
      where: {
        releasedAt: null,
        expiresAt: { lte: now },
      },
      include: {
        variant: { select: { sku: true } },
      },
    });

    if (expiredReservations.length === 0) {
      return { releasedCount: 0 };
    }

    let releasedCount = 0;

    for (const res of expiredReservations) {
      try {
        await prisma.$transaction(async (tx) => {
          // Double check within transaction
          const check = await tx.inventoryReservation.findUnique({ where: { id: res.id } });
          if (!check || check.releasedAt) return;

          await tx.inventoryReservation.update({
            where: { id: res.id },
            data: { releasedAt: now },
          });

          const inventory = await tx.inventory.findUnique({
            where: { variantId: res.variantId },
          });

          if (inventory) {
            const newReserved = Math.max(0, inventory.quantityReserved - res.quantity);
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantityReserved: newReserved },
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: res.variantId,
                movementType: InventoryMovementType.RELEASE,
                quantity: res.quantity,
                referenceType: "TTL_EXPIRATION",
                referenceId: res.id,
                notes: `Auto-released expired 15-minute hold for ${res.variant?.sku || res.variantId}`,
              },
            });
          }
        });
        releasedCount++;
      } catch (err) {
        console.error(`Failed to release expired reservation ${res.id}:`, err);
      }
    }

    return { releasedCount };
  }

  static async updateReorderLevel(variantId: string, reorderLevel: number) {
    const inventory = await prisma.inventory.findUnique({ where: { variantId } });
    if (!inventory) throw new NotFoundError("Inventory row for variant not found");

    return prisma.inventory.update({
      where: { variantId },
      data: { reorderLevel },
    });
  }
}
