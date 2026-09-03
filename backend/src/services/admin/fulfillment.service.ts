import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { ShipmentStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

export class AdminFulfillmentService {
  static async getShipments(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "trackingNumber", "carrier", "status"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(ShipmentStatus).includes(query.status as ShipmentStatus)) {
      where.status = query.status as ShipmentStatus;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { carrier: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: {
            select: { id: true, orderNumber: true, customerEmail: true },
          },
          items: {
            include: {
              orderItem: {
                select: { sku: true, productName: true },
              },
            },
          },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return { shipments, total, page, limit };
  }

  static async getShipmentDetails(id: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          select: { id: true, orderNumber: true, status: true, customerEmail: true, customerPhone: true },
        },
        items: {
          include: {
            orderItem: {
              select: { sku: true, productName: true, variantName: true },
            },
          },
        },
      },
    });

    if (!shipment) throw new NotFoundError("Shipment record not found");
    return shipment;
  }

  static async createShipment(data: {
    orderId: string;
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string | null;
    notes?: string | null;
    items?: Array<{ orderItemId: string; quantity: number }> | null;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError("Order not found");

    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      throw new ValidationError(`Cannot create shipment for order in '${order.status}' status`);
    }

    // If items are not provided, fulfill all items from the order
    let fulfillmentItems = data.items;
    if (!fulfillmentItems || fulfillmentItems.length === 0) {
      fulfillmentItems = order.items.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      }));
    }

    if (fulfillmentItems.length === 0) {
      throw new ValidationError("Order has no line items available for fulfillment");
    }

    const cleanTrackingUrl = data.trackingUrl && data.trackingUrl.trim() ? data.trackingUrl.trim() : null;

    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          orderId: data.orderId,
          carrier: data.carrier,
          trackingNumber: data.trackingNumber,
          trackingUrl: cleanTrackingUrl,
          status: ShipmentStatus.PENDING,
          shippedAt: new Date(),
          items: {
            create: fulfillmentItems!.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Advance order status to SHIPPED if not already
      if (order.status === "PROCESSING" || order.status === "CONFIRMED" || order.status === "PENDING") {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: "SHIPPED" },
        });
      }

      return shipment;
    });
  }

  static async updateShipmentStatus(id: string, status: ShipmentStatus) {
    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundError("Shipment record not found");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id },
        data: {
          status,
          deliveredAt: status === ShipmentStatus.DELIVERED ? new Date() : undefined,
        },
      });

      if (status === ShipmentStatus.DELIVERED) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: "DELIVERED" },
        });
      }

      return updated;
    });
  }
}
