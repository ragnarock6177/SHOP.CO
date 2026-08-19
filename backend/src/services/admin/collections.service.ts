import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { CategoryStatus } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

export class AdminCollectionsService {
  static async getCollections(query: Record<string, any>) {
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

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { productCollections: true } },
        },
      }),
      prisma.collection.count({ where }),
    ]);

    return { collections, total, page, limit };
  }

  static async createCollection(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    status?: CategoryStatus;
    sortOrder?: number;
  }) {
    const existing = await prisma.collection.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new ConflictError("A collection with this slug already exists");
    }

    return prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        status: data.status || CategoryStatus.ACTIVE,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  static async updateCollection(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      status?: CategoryStatus;
      sortOrder?: number;
    }
  ) {
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      throw new NotFoundError("Collection not found");
    }

    if (data.slug && data.slug !== collection.slug) {
      const existing = await prisma.collection.findUnique({ where: { slug: data.slug } });
      if (existing) {
        throw new ConflictError("A collection with this slug already exists");
      }
    }

    return prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        status: data.status,
        sortOrder: data.sortOrder,
      },
    });
  }
}
