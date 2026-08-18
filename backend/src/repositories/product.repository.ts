import prisma from "../lib/prisma.js";

export class ProductRepository {
  async findAll(params: {
    category?: string;
    search?: string;
    limit?: number;
  }) {
    const { category, search, limit } = params;

    const whereClause: any = { status: "ACTIVE", deletedAt: null };

    if (category) {
      whereClause.productCategories = {
        some: { category: { slug: category.toLowerCase() } },
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.product.findMany({
      where: whereClause,
      take: limit ? Number(limit) : undefined,
      include: {
        productCategories: { include: { category: true } },
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        productCategories: { include: { category: true } },
        images: true,
        variants: true,
        reviews: true,
      },
    });
  }
}

export const productRepository = new ProductRepository();
