import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { ProductStatus, ProductVisibility } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

export class AdminProductsService {
  static async getProducts(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "updatedAt", "name", "basePrice", "status"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(ProductStatus).includes(query.status as ProductStatus)) {
      where.status = query.status as ProductStatus;
    }

    if (query.visibility && Object.values(ProductVisibility).includes(query.visibility as ProductVisibility)) {
      where.visibility = query.visibility as ProductVisibility;
    }

    if (query.categoryId) {
      where.productCategories = {
        some: { categoryId: query.categoryId },
      };
    }

    if (query.collectionId) {
      where.productCollections = {
        some: { collectionId: query.collectionId },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          status: true,
          visibility: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { imageUrl: true, altText: true },
          },
          productCategories: {
            select: {
              isPrimary: true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
          variants: {
            select: { id: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      basePrice: p.basePrice ? p.basePrice.toNumber() : null,
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
      primaryImage: p.images[0]?.imageUrl || null,
      variantCount: p.variants.length,
    }));

    return {
      products: formattedProducts,
      total,
      page,
      limit,
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
        productCategories: { include: { category: true } },
        productCollections: { include: { collection: true } },
        variants: {
          include: {
            inventory: true,
            variantAttributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return {
      ...product,
      basePrice: product.basePrice ? product.basePrice.toNumber() : null,
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toNumber() : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price.toNumber(),
        compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toNumber() : null,
        costPrice: v.costPrice ? v.costPrice.toNumber() : null,
        weightGrams: v.weightGrams ? v.weightGrams.toNumber() : null,
        stockAvailable: v.inventory
          ? Math.max(0, v.inventory.quantityOnHand - v.inventory.quantityReserved)
          : 0,
      })),
    };
  }

  static async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    productType?: string;
    status?: ProductStatus;
    visibility?: ProductVisibility;
    basePrice?: number;
    compareAtPrice?: number;
    careInstructions?: string;
    categoryId?: string;
  }) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new ConflictError("A product with this slug already exists");
    }

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          productType: data.productType,
          status: data.status || ProductStatus.DRAFT,
          visibility: data.visibility || ProductVisibility.PUBLIC,
          basePrice: data.basePrice,
          compareAtPrice: data.compareAtPrice,
          careInstructions: data.careInstructions,
        },
      });

      if (data.categoryId) {
        await tx.productCategory.create({
          data: {
            productId: product.id,
            categoryId: data.categoryId,
            isPrimary: true,
          },
        });
      }

      return product;
    });

    return this.getProductById(created.id);
  }

  static async updateProduct(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      shortDescription?: string;
      productType?: string;
      status?: ProductStatus;
      visibility?: ProductVisibility;
      basePrice?: number;
      compareAtPrice?: number;
      careInstructions?: string;
      categoryId?: string;
    }
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (data.slug && data.slug !== product.slug) {
      const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (existing) {
        throw new ConflictError("A product with this slug already exists");
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          productType: data.productType,
          status: data.status,
          visibility: data.visibility,
          basePrice: data.basePrice,
          compareAtPrice: data.compareAtPrice,
          careInstructions: data.careInstructions,
        },
      });

      if (data.categoryId) {
        await tx.productCategory.deleteMany({ where: { productId: id, isPrimary: true } });
        await tx.productCategory.create({
          data: {
            productId: id,
            categoryId: data.categoryId,
            isPrimary: true,
          },
        });
      }
    });

    return this.getProductById(id);
  }

  static async archiveProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });

    return { id, status: ProductStatus.ARCHIVED };
  }
}
