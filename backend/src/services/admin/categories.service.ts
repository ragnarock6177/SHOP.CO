import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { CategoryStatus } from "@prisma/client";
import { ValidationError, ConflictError, NotFoundError } from "../../utils/errors.js";

export class AdminCategoriesService {
  static async getCategories(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "name", "sortOrder", "status"],
      "sortOrder"
    );

    const where: any = {};

    if (query.status && Object.values(CategoryStatus).includes(query.status as CategoryStatus)) {
      where.status = query.status as CategoryStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { productCategories: true, children: true } },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return { categories, total, page, limit };
  }

  static async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    status?: CategoryStatus;
    sortOrder?: number;
  }) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new ConflictError("A category with this slug already exists");
    }

    if (data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new NotFoundError("Parent category not found");
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
        status: data.status || CategoryStatus.ACTIVE,
        sortOrder: data.sortOrder || 0,
      },
      include: {
        parent: true,
      },
    });
  }

  static async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      parentId?: string;
      status?: CategoryStatus;
      sortOrder?: number;
    }
  ) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (data.parentId && data.parentId === id) {
      throw new ValidationError("A category cannot be its own parent");
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (existing) {
        throw new ConflictError("A category with this slug already exists");
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
        status: data.status,
        sortOrder: data.sortOrder,
      },
      include: {
        parent: true,
      },
    });
  }
}
