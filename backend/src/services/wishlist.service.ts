import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export class WishlistService {
  static async getUserWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                currency: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId, name: "My Wishlist" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  basePrice: true,
                  currency: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      });
    }

    return {
      id: wishlist.id,
      name: wishlist.name,
      items: wishlist.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        basePrice: item.product.basePrice ? item.product.basePrice.toNumber() : null,
        imageUrl: item.product.images[0]?.imageUrl || null,
        addedAt: item.createdAt,
      })),
    };
  }

  static async addProductToWishlist(userId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "ACTIVE", deletedAt: null },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const wishlist = await this.getUserWishlist(userId);

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return this.getUserWishlist(userId);
  }

  static async removeProductFromWishlist(userId: string, productId: string) {
    const wishlist = await prisma.wishlist.findFirst({ where: { userId } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: { wishlistId: wishlist.id, productId },
      });
    }
    return this.getUserWishlist(userId);
  }
}
