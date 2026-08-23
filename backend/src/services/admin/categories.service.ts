import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { CategoryStatus } from "@prisma/client";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors.js";

// High-performance in-memory cache for categories (2 min fresh TTL, 1 hr stale fallback)
interface CachedCategories {
  data: any;
  expiresAt: number;
}
const categoriesCache = new Map<string, CachedCategories>();

export function invalidateCategoriesCache() {
  categoriesCache.clear();
}

export class AdminCategoriesService {
  static async getCategories(query: Record<string, any>) {
    const cacheKey = JSON.stringify(query);
    const cached = categoriesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const { page, limit, sortBy, sortOrder, search, skip } =
      parseAdminQueryParams(
        query,
        ["createdAt", "name", "sortOrder", "status"],
        "sortOrder",
      );

    const where: any = {};

    if (
      query.status &&
      Object.values(CategoryStatus).includes(query.status as CategoryStatus)
    ) {
      where.status = query.status as CategoryStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
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

      const result = { categories, total, page, limit };
      categoriesCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + 2 * 60 * 1000,
      });

      return result;
    } catch (err: any) {
      if (cached) {
        console.warn(
          `[CategoriesService] DB connection issue. Serving cached categories for key: ${cacheKey}`,
        );
        return cached.data;
      }
      throw err;
    }
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
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictError("A category with this slug already exists");
    }

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw new NotFoundError("Parent category not found");
    }

    const res = await prisma.category.create({
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
    invalidateCategoriesCache();
    return res;
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
    },
  ) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (data.parentId && data.parentId === id) {
      throw new ValidationError("A category cannot be its own parent");
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        throw new ConflictError("A category with this slug already exists");
      }
    }

    const res = await prisma.category.update({
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
    invalidateCategoriesCache();
    return res;
  }
}
