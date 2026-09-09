import prisma from "../lib/prisma.js";
import { NotFoundError, UnprocessableEntityError, ForbiddenError } from "../utils/errors.js";
import { parsePaginationParams, buildPaginationMeta } from "../utils/pagination.js";
import { AddressType, OrderStatus, PaymentStatus, InventoryMovementType } from "@prisma/client";

export class OrderService {
  static async createOrder(
    userId: string | undefined,
    customerEmail: string | undefined,
    payload: {
      items: {
        id?: string;
        variantId?: string;
        productId?: string;
        quantity: number;
        selectedColor?: string;
        selectedSize?: string;
        unitPrice?: number;
        title?: string;
        image?: string;
      }[];
      shippingAddress?: any;
      shippingAddressId?: string;
      billingAddress?: any;
      billingAddressId?: string;
      saveShippingAddress?: boolean;
      couponId?: string;
      couponCode?: string;
      shippingSpeed?: "STANDARD" | "EXPRESS";
      paymentMethod?: string;
      notes?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];

      // 0. Verify userId exists in DB if provided
      let validUserId: string | null = null;
      if (userId) {
        const dbUser = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (dbUser) {
          validUserId = dbUser.id;
        }
      }

      let resolvedShipping: any = payload.shippingAddress;

      if (payload.shippingAddressId) {
        if (!validUserId) {
          throw new ForbiddenError("You must be logged in to use a saved address");
        }

        const savedAddress = await tx.userAddress.findFirst({
          where: {
            id: payload.shippingAddressId,
            userId: validUserId,
            deletedAt: null,
            type: AddressType.SHIPPING,
          },
        });

        if (!savedAddress) {
          throw new NotFoundError("Saved shipping address not found");
        }

        resolvedShipping = {
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName || "",
          addressLine1: savedAddress.addressLine1,
          addressLine2: savedAddress.addressLine2 || "",
          landmark: savedAddress.landmark || "",
          city: savedAddress.city,
          state: savedAddress.state,
          postalCode: savedAddress.postalCode,
          countryCode: savedAddress.countryCode,
          phone: savedAddress.phone || "",
          email: customerEmail,
        };
      }

      if (!resolvedShipping) {
        throw new UnprocessableEntityError("Shipping address is required");
      }

      let resolvedBilling: any = payload.billingAddress;

      if (payload.billingAddressId) {
        if (!validUserId) {
          throw new ForbiddenError("You must be logged in to use a saved billing address");
        }

        const savedBilling = await tx.userAddress.findFirst({
          where: {
            id: payload.billingAddressId,
            userId: validUserId,
            deletedAt: null,
          },
        });

        if (!savedBilling) {
          throw new NotFoundError("Saved billing address not found");
        }

        resolvedBilling = {
          firstName: savedBilling.firstName,
          lastName: savedBilling.lastName || "",
          addressLine1: savedBilling.addressLine1,
          addressLine2: savedBilling.addressLine2 || "",
          landmark: savedBilling.landmark || "",
          city: savedBilling.city,
          state: savedBilling.state,
          postalCode: savedBilling.postalCode,
          countryCode: savedBilling.countryCode,
          phone: savedBilling.phone || "",
        };
      }

      // 1. Resolve item details & validate stock directly from DB as single source of truth
      const pendingReservations: { variantId: string; inventoryId: string; quantity: number }[] = [];
      for (const item of payload.items) {
        const targetId = item.id || item.variantId || item.productId;
        let variant: any = null;
        let product: any = null;

        if (targetId) {
          // 1a. Attempt lookup by ProductVariant ID
          variant = await tx.productVariant.findFirst({
            where: { id: targetId, isActive: true, deletedAt: null },
            include: {
              product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
              inventory: true,
            },
          });

          // 1b. If not a variant ID, attempt lookup by Product ID
          if (!variant) {
            product = await tx.product.findFirst({
              where: { id: targetId, status: "ACTIVE", deletedAt: null },
              include: {
                variants: {
                  where: { isActive: true, deletedAt: null },
                  include: { inventory: true },
                },
                images: { take: 1, orderBy: { sortOrder: "asc" } },
              },
            });

            if (product && product.variants.length > 0) {
              variant =
                product.variants.find(
                  (v: any) =>
                    (!item.selectedColor || v.color === item.selectedColor) &&
                    (!item.selectedSize || v.size === item.selectedSize)
                ) || product.variants[0];
              variant.product = product;
            }
          }
        }

        let unitPrice = item.unitPrice || 0;
        let sku = `SKU-${Date.now().toString().slice(-6)}`;
        let productName = item.title || "Selected Garment";
        let variantName = `${item.selectedColor || "Standard"} / ${item.selectedSize || "Default"}`;
        let variantId: string | null = null;

        if (variant) {
          // Authoritative DB pricing, name, and stock
          unitPrice = variant.price ? Number(variant.price) : Number(variant.product.basePrice);
          sku = variant.sku;
          productName = variant.product.name;
          variantName = variant.variantName || `${item.selectedColor || "Standard"} / ${item.selectedSize || "M"}`;
          variantId = variant.id;

          const available = variant.inventory
            ? variant.inventory.quantityOnHand - variant.inventory.quantityReserved
            : 50;

          if (available < item.quantity) {
            throw new UnprocessableEntityError(
              `Stock unavailable for ${productName} (${variantName}). Only ${available} left in stock.`
            );
          }

          if (variant.inventory) {
            pendingReservations.push({
              variantId: variant.id,
              inventoryId: variant.inventory.id,
              quantity: item.quantity,
            });
          }
        } else if (product) {
          unitPrice = Number(product.basePrice);
          productName = product.name;
        }

        const qty = Math.max(1, item.quantity);
        const itemTotal = Math.round(unitPrice * qty * 100) / 100;
        subtotal += itemTotal;

        orderItemsData.push({
          variantId,
          sku,
          productName,
          variantName,
          quantity: qty,
          unitPrice,
          totalAmount: itemTotal,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      // 2. Coupon Validation & Discount Calculation (DB as single source of truth by couponId or couponCode)
      let discountAmount = 0;
      let couponRecord: any = null;

      const couponQuery = payload.couponId
        ? { id: payload.couponId, isActive: true }
        : payload.couponCode && payload.couponCode.trim().length > 0
        ? { code: payload.couponCode.trim().toUpperCase(), isActive: true }
        : null;

      if (couponQuery) {
        couponRecord = await tx.coupon.findFirst({
          where: couponQuery,
        });

        if (couponRecord) {
          if (couponRecord.minimumOrderAmount && subtotal < couponRecord.minimumOrderAmount.toNumber()) {
            throw new UnprocessableEntityError(
              `Subtotal (₹${subtotal}) does not meet coupon minimum requirement of ₹${couponRecord.minimumOrderAmount.toNumber()}`
            );
          }

          if (couponRecord.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * couponRecord.discountValue.toNumber()) / 100;
            if (couponRecord.maximumDiscountAmount) {
              discountAmount = Math.min(discountAmount, couponRecord.maximumDiscountAmount.toNumber());
            }
          } else {
            discountAmount = couponRecord.discountValue.toNumber();
          }

          discountAmount = Math.min(discountAmount, subtotal);
        } else if (payload.couponCode) {
          const code = payload.couponCode.trim().toUpperCase();
          if (code === "SUMMER2026" || code === "AIRAVE15") {
            discountAmount = (subtotal * 15) / 100;
          } else if (code === "LUMINA30" || code === "AIRAVE20") {
            discountAmount = (subtotal * 20) / 100;
          }
        }
      }

      discountAmount = Math.round(discountAmount * 100) / 100;

      // 3. Shipping & Tax
      const isExpress = payload.shippingSpeed === "EXPRESS";
      const baseShipping = subtotal >= 1999 ? 0 : 99;
      const shippingAmount = isExpress ? baseShipping + 150 : baseShipping;

      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
      const totalAmount = Math.round((subtotal - discountAmount + shippingAmount + taxAmount) * 100) / 100;

      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Create Order Header & Addresses
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: validUserId,
          customerEmail: customerEmail || resolvedShipping.email || "guest@airave.com",
          status: OrderStatus.CONFIRMED,
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount,
          totalAmount,
          notes: payload.notes,
          placedAt: new Date(),
          addresses: {
            create: [
              {
                type: AddressType.SHIPPING,
                firstName: resolvedShipping.firstName,
                lastName: resolvedShipping.lastName || "",
                addressLine1: resolvedShipping.addressLine1 || resolvedShipping.address || "Street Address",
                addressLine2: resolvedShipping.addressLine2 || "",
                landmark: resolvedShipping.landmark || "",
                city: resolvedShipping.city,
                state: resolvedShipping.state,
                postalCode: resolvedShipping.postalCode || resolvedShipping.zip || "400001",
                countryCode: resolvedShipping.countryCode || "IN",
                phone: resolvedShipping.phone || "",
              },
              {
                type: AddressType.BILLING,
                ...(resolvedBilling
                  ? {
                      firstName: resolvedBilling.firstName,
                      lastName: resolvedBilling.lastName || "",
                      addressLine1: resolvedBilling.addressLine1 || resolvedBilling.address || "Street Address",
                      addressLine2: resolvedBilling.addressLine2 || "",
                      landmark: resolvedBilling.landmark || "",
                      city: resolvedBilling.city,
                      state: resolvedBilling.state,
                      postalCode: resolvedBilling.postalCode || resolvedBilling.zip || "400001",
                      countryCode: resolvedBilling.countryCode || "IN",
                      phone: resolvedBilling.phone || "",
                    }
                  : {
                      firstName: resolvedShipping.firstName,
                      lastName: resolvedShipping.lastName || "",
                      addressLine1: resolvedShipping.addressLine1 || resolvedShipping.address || "Street Address",
                      addressLine2: resolvedShipping.addressLine2 || "",
                      landmark: resolvedShipping.landmark || "",
                      city: resolvedShipping.city,
                      state: resolvedShipping.state,
                      postalCode: resolvedShipping.postalCode || resolvedShipping.zip || "400001",
                      countryCode: resolvedShipping.countryCode || "IN",
                      phone: resolvedShipping.phone || "",
                    }),
              },
            ],
          },
          items: {
            create: orderItemsData,
          },
          payments: {
            create: {
              provider: payload.paymentMethod || "COD",
              status: payload.paymentMethod === "COD" ? PaymentStatus.PENDING : PaymentStatus.CAPTURED,
              amount: totalAmount,
              currency: "INR",
            },
          },
          statusHistory: {
            create: {
              newStatus: OrderStatus.CONFIRMED,
              reason: "Order successfully placed by customer",
            },
          },
        },
        include: {
          addresses: true,
          items: true,
          payments: true,
        },
      });

      // 4b. Create Inventory Reservations linked directly to this order
      for (const resItem of pendingReservations) {
        await tx.inventory.update({
          where: { id: resItem.inventoryId },
          data: { quantityReserved: { increment: resItem.quantity } },
        });

        const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
        await tx.inventoryReservation.create({
          data: {
            variantId: resItem.variantId,
            orderId: order.id,
            quantity: resItem.quantity,
            expiresAt: expiryDate,
          },
        });
      }

      // 4c. If COD payment, immediately deduct physical stock and mark reservation fulfilled
      if (payload.paymentMethod === "COD") {
        for (const item of order.items) {
          if (item.variantId) {
            const inventory = await tx.inventory.findFirst({ where: { variantId: item.variantId } });
            if (inventory) {
              await tx.inventory.update({
                where: { id: inventory.id },
                data: {
                  quantityOnHand: Math.max(0, inventory.quantityOnHand - item.quantity),
                  quantityReserved: Math.max(0, inventory.quantityReserved - item.quantity),
                },
              });

              await tx.inventoryMovement.create({
                data: {
                  variantId: item.variantId,
                  movementType: InventoryMovementType.SALE,
                  quantity: -item.quantity,
                  referenceType: "ORDER",
                  referenceId: order.id,
                  notes: `Deducted for COD Order ${order.orderNumber}`,
                },
              });
            }
          }
        }

        await tx.inventoryReservation.updateMany({
          where: { orderId: order.id, releasedAt: null },
          data: { releasedAt: new Date() },
        });
      }

      // 5. Record Coupon Usage if DB Coupon found
      if (couponRecord) {
        await tx.couponUsage.create({
          data: {
            couponId: couponRecord.id,
            userId: validUserId,
            orderId: order.id,
            discountAmount,
          },
        });

        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { usedCount: couponRecord.usedCount + 1 },
        });
      }

      // 6. Clear user cart if validUserId authenticated
      if (validUserId) {
        const userCart = await tx.cart.findFirst({ where: { userId: validUserId, status: "ACTIVE" } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

      // 7. Persist new shipping address for future orders when requested
      if (
        validUserId &&
        payload.saveShippingAddress &&
        payload.shippingAddress &&
        !payload.shippingAddressId
      ) {
        const addr = payload.shippingAddress;
        const existingCount = await tx.userAddress.count({
          where: { userId: validUserId, deletedAt: null, type: AddressType.SHIPPING },
        });
        const shouldBeDefault = addr.isDefault ?? existingCount === 0;

        if (shouldBeDefault) {
          await tx.userAddress.updateMany({
            where: { userId: validUserId, type: AddressType.SHIPPING, deletedAt: null },
            data: { isDefault: false },
          });
        }

        await tx.userAddress.create({
          data: {
            userId: validUserId,
            type: AddressType.SHIPPING,
            label: addr.label || "Home",
            firstName: addr.firstName,
            lastName: addr.lastName || "",
            addressLine1: addr.addressLine1 || addr.address,
            addressLine2: addr.addressLine2 || "",
            landmark: addr.landmark || "",
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode || addr.zip,
            countryCode: addr.countryCode || "IN",
            phone: addr.phone || "",
            isDefault: shouldBeDefault,
          },
        });
      }

      return order;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });
  }

  static async getUserOrders(userId: string, queryPage?: string, queryLimit?: string) {
    const { page, limit, skip } = parsePaginationParams(queryPage, queryLimit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
                  },
                },
              },
            },
          },
          addresses: true,
          shipments: true,
          payments: true,
        },
      }),
      prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);

    const meta = buildPaginationMeta(page, limit, total);
    return { data: orders, meta };
  }

  static async getOrderByNumber(orderNumber: string, userId?: string) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, deletedAt: null },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
                },
              },
            },
          },
        },
        addresses: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        shipments: { include: { statusHistory: true } },
        payments: { include: { transactions: true } },
        invoice: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new ForbiddenError("Access denied. You cannot view orders belonging to another user.");
    }

    const hydratedItems = order.items.map((item: any) => {
      const img =
        item.variant?.product?.images?.[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80";
      return {
        ...item,
        image: img,
      };
    });

    return {
      ...order,
      items: hydratedItems,
    };
  }

  static async cancelOrder(orderId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId, deletedAt: null },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new UnprocessableEntityError(`Cannot cancel order in ${order.status} state.`);
      }

      for (const item of order.items) {
        if (item.variantId) {
          const inventory = await tx.inventory.findFirst({ where: { variantId: item.variantId } });
          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                quantityReserved: Math.max(0, inventory.quantityReserved - item.quantity),
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          statusHistory: {
            create: {
              oldStatus: order.status,
              newStatus: OrderStatus.CANCELLED,
              changedBy: userId,
              reason: "Cancelled by user",
            },
          },
        },
      });

      return updated;
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  }
}
