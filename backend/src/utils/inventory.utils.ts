import { InventoryMovementType } from "@prisma/client";

export const LOW_STOCK_THRESHOLD = 5;

type InventoryRecord = {
  quantityOnHand: number;
  quantityReserved: number;
};

export function getAvailableStock(
  inventory: InventoryRecord | null | undefined
): number {
  if (!inventory) return 0;
  return Math.max(0, inventory.quantityOnHand - inventory.quantityReserved);
}

export function getStockStatus(
  available: number
): "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK" {
  if (available <= 0) return "OUT_OF_STOCK";
  if (available <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "IN_STOCK";
}


export async function restoreInventoryForOrder(
  tx: any,
  orderId: string,
  orderNumber: string,
  orderItems: { variantId: string | null; quantity: number }[],
  notes: string,
  changedBy?: string
): Promise<void> {
  for (const item of orderItems) {
    if (!item.variantId) continue;

    const inventory = await tx.inventory.findFirst({
      where: { variantId: item.variantId },
    });
    if (!inventory) continue;

    const saleMovement = await tx.inventoryMovement.findFirst({
      where: {
        variantId: item.variantId,
        referenceType: "ORDER",
        referenceId: orderId,
        movementType: InventoryMovementType.SALE,
      },
    });

    if (saleMovement) {
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantityOnHand: inventory.quantityOnHand + item.quantity,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          movementType: InventoryMovementType.RELEASE,
          quantity: item.quantity,
          referenceType: "ORDER_CANCELLATION",
          referenceId: orderId,
          notes: notes || `Order #${orderNumber} cancelled`,
          createdBy: changedBy,
        },
      });
    } else {
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantityReserved: Math.max(0, inventory.quantityReserved - item.quantity),
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          movementType: InventoryMovementType.RELEASE,
          quantity: item.quantity,
          referenceType: "ORDER_CANCELLATION",
          referenceId: orderId,
          notes: notes || `Released reservation for order #${orderNumber}`,
          createdBy: changedBy,
        },
      });
    }

    await tx.inventoryReservation.updateMany({
      where: { orderId, variantId: item.variantId, releasedAt: null },
      data: { releasedAt: new Date() },
    });
  }
}
