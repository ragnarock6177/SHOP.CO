import { prisma } from '../config/db.js';

export class ProductRepository {
  async findAll(params: { category?: string; search?: string; limit?: number }) {
    const { category, search, limit } = params;

    const whereClause: any = {};

    if (category) {
      whereClause.category = {
        slug: category.toLowerCase(),
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where: whereClause,
      take: limit ? Number(limit) : undefined,
      include: {
        category: true,
        colors: true,
        sizes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        colors: true,
        sizes: true,
        reviews: true,
      },
    });
  }
}

export const productRepository = new ProductRepository();
