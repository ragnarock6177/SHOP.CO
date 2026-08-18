import prisma from "../lib/prisma.js";
import { NotFoundError, UnprocessableEntityError } from "../utils/errors.js";

export class CartService {
  static async getOrCreateCart(userId?: string, guestToken?: string) {
    if (!userId && !guestToken) {
      throw new UnprocessableEntityError("Either userId or guestToken must be provided to access cart");
    }

    let cart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: "ACTIVE" }
        : { guestToken, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId || null,
          guestToken: !userId && guestToken ? guestToken : null,
          status: "ACTIVE",
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
                },
              },
            },
          },
        },
      });
    }

    let subtotal = 0;
    let totalQuantity = 0;

    const formattedItems = cart.items.map((item) => {
      const unitPrice = item.variant.price.toNumber();
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      totalQuantity += item.quantity;

      return {
        id: item.id,
        variantId: item.variantId,
        productId: item.variant.productId,
        productName: item.variant.product.name,
        productSlug: item.variant.product.slug,
        variantName: item.variant.variantName,
        sku: item.variant.sku,
        unitPrice,
        quantity: item.quantity,
        itemTotal,
        imageUrl: item.variant.product.images[0]?.imageUrl || null,
      };
    });

    return {
      id: cart.id,
      userId: cart.userId,
      guestToken: cart.guestToken,
      status: cart.status,
      subtotal,
      totalQuantity,
      items: formattedItems,
    };
  }

  static async addItemToCart(payload: { variantId: string; quantity: number }, userId?: string, guestToken?: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: payload.variantId, isActive: true, deletedAt: null },
      include: { inventory: true },
    });

    if (!variant) {
      throw new NotFoundError("Product variant not found or inactive");
    }

    const available = variant.inventory
      ? variant.inventory.quantityOnHand - variant.inventory.quantityReserved
      : 0;

    if (available < payload.quantity) {
      throw new UnprocessableEntityError(`Insufficient stock. Only ${available} item(s) available.`);
    }

    const cart = await this.getOrCreateCart(userId, guestToken);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: payload.variantId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + payload.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: payload.variantId,
          quantity: payload.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId, guestToken);
  }

  static async updateItemQuantity(cartItemId: string, quantity: number, userId?: string, guestToken?: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { variant: { include: { inventory: true } } },
    });

    if (!item) {
      throw new NotFoundError("Cart item not found");
    }

    const available = item.variant.inventory
      ? item.variant.inventory.quantityOnHand - item.variant.inventory.quantityReserved
      : 0;

    if (available < quantity) {
      throw new UnprocessableEntityError(`Cannot update quantity. Only ${available} item(s) available.`);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getOrCreateCart(userId, guestToken);
  }

  static async removeItemFromCart(cartItemId: string, userId?: string, guestToken?: string) {
    await prisma.cartItem.deleteMany({
      where: { id: cartItemId },
    });

    return this.getOrCreateCart(userId, guestToken);
  }

  static async mergeGuestCartToUser(guestToken: string, userId: string) {
    const guestCart = await prisma.cart.findFirst({
      where: { guestToken, status: "ACTIVE" },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: item.variantId,
          },
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    // Mark guest cart as merged/converted
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { status: "CONVERTED" },
    });

    return this.getOrCreateCart(userId);
  }
}
