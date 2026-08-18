import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export class CatalogService {
  static async listCollections() {
    return prisma.collection.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
      },
    });
  }

  static async getCollectionBySlug(slug: string) {
    const collection = await prisma.collection.findFirst({
      where: { slug, status: "ACTIVE", deletedAt: null },
      include: {
        productCollections: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                compareAtPrice: true,
                currency: true,
                status: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { imageUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundError("Collection not found");
    }

    return collection;
  }

  static async listCategoriesTree() {
    return prisma.category.findMany({
      where: { parentId: null, status: "ACTIVE", deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { status: "ACTIVE", deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  static async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, status: "ACTIVE", deletedAt: null },
      include: {
        children: {
          where: { status: "ACTIVE", deletedAt: null },
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }
}
