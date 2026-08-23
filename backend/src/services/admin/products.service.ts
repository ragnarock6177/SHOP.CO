import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { ProductStatus, ProductVisibility } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { UploadService } from "./upload.service.js";


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
        images: {
          orderBy: { sortOrder: "asc" },
          include: {
            variantImages: {
              select: { variantId: true, sortOrder: true },
            },
          },
        },
        videos: { orderBy: { sortOrder: "asc" } },
        productCategories: { include: { category: true } },
        productCollections: { include: { collection: true } },
        variants: {
          include: {
            inventory: true,
            variantImages: {
              include: {
                image: true,
              },
            },
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
    id?: string;
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
    images?: Array<{
      imageUrl: string;
      altText?: string;
      sortOrder?: number;
      isPrimary?: boolean;
      variantIds?: string[];
    }>;
  }) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const validProductId = data.id && uuidRegex.test(data.id) ? data.id : undefined;

    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new ConflictError("A product with this slug already exists");
    }

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          id: validProductId,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          shortDescription: data.shortDescription || null,
          productType: data.productType || null,
          status: data.status || ProductStatus.DRAFT,
          visibility: data.visibility || ProductVisibility.PUBLIC,
          basePrice: data.basePrice !== undefined && !isNaN(Number(data.basePrice)) ? Number(data.basePrice) : 0,
          compareAtPrice: data.compareAtPrice !== undefined && !isNaN(Number(data.compareAtPrice)) ? Number(data.compareAtPrice) : null,
          careInstructions: data.careInstructions || null,
        },
      });

      if (data.categoryId && uuidRegex.test(data.categoryId)) {
        const catExists = await tx.category.findUnique({ where: { id: data.categoryId } });
        if (catExists) {
          await tx.productCategory.create({
            data: {
              productId: product.id,
              categoryId: data.categoryId,
              isPrimary: true,
            },
          });
        }
      }

      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i];
          if (!img.imageUrl || img.imageUrl.startsWith("blob:")) continue;

          const createdImg = await tx.productImage.create({
            data: {
              productId: product.id,
              imageUrl: img.imageUrl,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? i,
              isPrimary: img.isPrimary ?? i === 0,
            },
          });

          if (img.variantIds && img.variantIds.length > 0) {
            const validVariantIds = img.variantIds.filter((vId) => uuidRegex.test(vId));
            if (validVariantIds.length > 0) {
              const existingVariants = await tx.productVariant.findMany({
                where: { id: { in: validVariantIds } },
                select: { id: true },
              });
              const existingVariantIds = existingVariants.map((v) => v.id);

              if (existingVariantIds.length > 0) {
                await tx.variantImage.createMany({
                  data: existingVariantIds.map((vId, vIdx) => ({
                    variantId: vId,
                    imageId: createdImg.id,
                    sortOrder: vIdx,
                  })),
                });
              }
            }
          }
        }
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

  // ──────────────────────────────────────────────────────────
  // IMAGE CRUD
  // ──────────────────────────────────────────────────────────

  static async listImages(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Product not found");

    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
      include: {
        variantImages: {
          select: { variantId: true, sortOrder: true },
        },
      },
    });
  }

  static async addImage(
    productId: string,
    data: {
      imageUrl: string;
      altText?: string;
      storagePath?: string;
      sortOrder?: number;
      isPrimary?: boolean;
      variantIds?: string[];
    }
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Product not found");

    return prisma.$transaction(async (tx) => {
      // If this image is primary, demote all others
      if (data.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      // Auto-assign sort order to end if not provided
      let sortOrder = data.sortOrder;
      if (sortOrder === undefined) {
        const count = await tx.productImage.count({ where: { productId } });
        sortOrder = count;
      }

      const img = await tx.productImage.create({
        data: {
          productId,
          imageUrl: data.imageUrl,
          altText: data.altText,
          sortOrder,
          isPrimary: data.isPrimary ?? false,
        },
      });

      if (data.variantIds && data.variantIds.length > 0) {
        await tx.variantImage.createMany({
          data: data.variantIds.map((vId, idx) => ({
            variantId: vId,
            imageId: img.id,
            sortOrder: idx,
          })),
        });
      }

      return tx.productImage.findUnique({
        where: { id: img.id },
        include: {
          variantImages: {
            select: { variantId: true, sortOrder: true },
          },
        },
      });
    });
  }

  static async updateImage(
    productId: string,
    imageId: string,
    data: {
      altText?: string;
      sortOrder?: number;
      isPrimary?: boolean;
      variantIds?: string[];
    }
  ) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw new NotFoundError("Image not found");

    return prisma.$transaction(async (tx) => {
      // If setting as primary, demote others first
      if (data.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId, id: { not: imageId } },
          data: { isPrimary: false },
        });
      }

      await tx.productImage.update({
        where: { id: imageId },
        data: {
          altText: data.altText,
          sortOrder: data.sortOrder,
          isPrimary: data.isPrimary,
        },
      });

      if (data.variantIds !== undefined) {
        await tx.variantImage.deleteMany({ where: { imageId } });
        if (data.variantIds.length > 0) {
          await tx.variantImage.createMany({
            data: data.variantIds.map((vId, idx) => ({
              variantId: vId,
              imageId,
              sortOrder: idx,
            })),
          });
        }
      }

      return tx.productImage.findUnique({
        where: { id: imageId },
        include: {
          variantImages: {
            select: { variantId: true, sortOrder: true },
          },
        },
      });
    });
  }

  static async deleteImage(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw new NotFoundError("Image not found");

    await prisma.productImage.delete({ where: { id: imageId } });

    // Derive storage path from the public URL and delete from Supabase
    try {
      const url = new URL(image.imageUrl);
      // Public URL pattern: /storage/v1/object/public/<bucket>/<path>
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
      if (pathMatch?.[1]) {
        await UploadService.deleteFile(pathMatch[1]);
      }
    } catch {
      // If URL parsing fails, skip storage deletion silently
    }

    return { id: imageId, deleted: true };
  }

  static async reorderImages(
    productId: string,
    orderedIds: string[]
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Product not found");

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.productImage.updateMany({
          where: { id, productId },
          data: { sortOrder: index },
        })
      )
    );

    return this.listImages(productId);
  }
}

