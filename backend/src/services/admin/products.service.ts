import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { ProductStatus, ProductVisibility } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { UploadService } from "./upload.service.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class AdminProductsService {
  static async getProducts(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } =
      parseAdminQueryParams(
        query,
        ["createdAt", "updatedAt", "name", "basePrice", "status"],
        "createdAt",
      );

    const where: any = {};

    if (query.status) {
      const statusUpper = String(query.status).toUpperCase();
      if (statusUpper === "PUBLISHED" || statusUpper === "ACTIVE") {
        where.status = ProductStatus.ACTIVE;
      } else if (
        Object.values(ProductStatus).includes(statusUpper as ProductStatus)
      ) {
        where.status = statusUpper as ProductStatus;
      }
    }

    if (
      query.visibility &&
      Object.values(ProductVisibility).includes(
        query.visibility as ProductVisibility,
      )
    ) {
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
            orderBy: { sortOrder: "asc" },
            select: {
              imageUrl: true,
              altText: true,
              isPrimary: true,
              sortOrder: true,
              variantImages: { select: { variantId: true } },
            },
          },
          productCategories: {
            select: {
              isPrimary: true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
          variants: {
            select: {
              id: true,
              inventory: {
                select: { quantityOnHand: true, quantityReserved: true },
              },
              variantAttributeValues: {
                select: {
                  attributeValue: {
                    select: {
                      value: true,
                      colorHex: true,
                      attribute: { select: { slug: true, name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => {
      const totalStock = p.variants.reduce((acc, v) => {
        const onHand = v.inventory?.quantityOnHand || 0;
        const reserved = v.inventory?.quantityReserved || 0;
        return acc + Math.max(0, onHand - reserved);
      }, 0);

      const uniqueColors = new Set<string>();
      const colorImages: any[] = [];

      const imagesWithVariants = p.images.map((img) => ({
        ...img,
        variantIds: img.variantImages.map((vi) => vi.variantId),
      }));

      for (const v of p.variants) {
        const colorVal = v.variantAttributeValues?.find(
          (vav) =>
            vav.attributeValue.attribute?.slug === "color" ||
            vav.attributeValue.attribute?.name?.toLowerCase() === "color" ||
            Boolean(vav.attributeValue.colorHex),
        )?.attributeValue;

        const colorKey = colorVal?.value || null;
        if (colorKey && !uniqueColors.has(colorKey)) {
          uniqueColors.add(colorKey);

          const img = imagesWithVariants.find(
            (i) =>
              i.variantIds.includes(v.id) ||
              (i.altText &&
                i.altText.toLowerCase().includes(colorKey.toLowerCase())),
          );
          if (img && !colorImages.some((ci) => ci.imageUrl === img.imageUrl)) {
            colorImages.push(img);
          }
        }
      }

      let displayImages =
        colorImages.length > 0 ? colorImages : imagesWithVariants;

      return {
        ...p,
        basePrice: p.basePrice ? p.basePrice.toNumber() : null,
        compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
        primaryImage:
          p.images.find((i) => i.isPrimary)?.imageUrl ||
          p.images[0]?.imageUrl ||
          null,
        variantCount: p.variants.length,
        totalStockAvailable: totalStock,
        displayImages: displayImages.map((i) => ({
          imageUrl: i.imageUrl,
          altText: i.altText,
          isPrimary: i.isPrimary,
          sortOrder: i.sortOrder,
        })),
      };
    });

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

    const totalStockOnHand = product.variants.reduce(
      (acc, v) => acc + (v.inventory?.quantityOnHand || 0),
      0,
    );
    const totalStockReserved = product.variants.reduce(
      (acc, v) => acc + (v.inventory?.quantityReserved || 0),
      0,
    );
    const totalStockAvailable = Math.max(
      0,
      totalStockOnHand - totalStockReserved,
    );
    const reorderLevel = product.variants.reduce(
      (min, v) => Math.min(min, v.inventory?.reorderLevel || 5),
      5,
    );

    let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
    if (totalStockAvailable <= 0) {
      stockStatus = "OUT_OF_STOCK";
    } else if (totalStockAvailable <= reorderLevel) {
      stockStatus = "LOW_STOCK";
    }

    return {
      ...product,
      images: product.images.map((img) => ({
        ...img,
        variantIds: img.variantImages.map((vi) => vi.variantId),
      })),
      basePrice: product.basePrice ? product.basePrice.toNumber() : null,
      compareAtPrice: product.compareAtPrice
        ? product.compareAtPrice.toNumber()
        : null,
      totalStockOnHand,
      totalStockAvailable,
      totalStockReserved,
      reorderLevel,
      stockStatus,
      variants: product.variants.map((v) => {
        const colorVal = v.variantAttributeValues.find(
          (vav) =>
            vav.attributeValue.attribute?.slug === "color" ||
            vav.attributeValue.attribute?.name?.toLowerCase() === "color" ||
            Boolean(vav.attributeValue.colorHex),
        )?.attributeValue;

        const sizeVal = v.variantAttributeValues.find(
          (vav) =>
            vav.attributeValue.attribute?.slug === "size" ||
            vav.attributeValue.attribute?.name?.toLowerCase() === "size",
        )?.attributeValue;

        const stockOnHand = v.inventory ? v.inventory.quantityOnHand : 0;
        const stockReserved = v.inventory ? v.inventory.quantityReserved : 0;
        const stockAvailable = Math.max(0, stockOnHand - stockReserved);
        const variantReorderLevel = v.inventory ? v.inventory.reorderLevel : 5;

        return {
          ...v,
          price: v.price.toNumber(),
          compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toNumber() : null,
          costPrice: v.costPrice ? v.costPrice.toNumber() : null,
          weightGrams: v.weightGrams ? v.weightGrams.toNumber() : null,
          inventory: v.inventory
            ? {
                ...v.inventory,
                version: Number(v.inventory.version),
              }
            : null,
          stockOnHand,
          stockReserved,
          stockAvailable,
          reorderLevel: variantReorderLevel,
          stockStatus:
            stockAvailable <= 0
              ? "OUT_OF_STOCK"
              : stockAvailable <= variantReorderLevel
                ? "LOW_STOCK"
                : "IN_STOCK",
          colorName: colorVal?.value || null,
          colorHex: colorVal?.colorHex || null,
          sizeName: sizeVal?.value || null,
        };
      }),
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
    stockQuantity?: number;
    reorderLevel?: number;
    careInstructions?: string;
    categoryId?: string;
    images?: Array<{
      imageUrl: string;
      altText?: string;
      sortOrder?: number;
      isPrimary?: boolean;
      variantIds?: string[];
    }>;
    variants?: Array<{
      id?: string;
      sku: string;
      colorName: string;
      colorHex?: string | null;
      sizeName: string;
      price: number;
      compareAtPrice?: number | null;
      stock?: number;
      isActive?: boolean;
    }>;
  }) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let validProductId: string | undefined = undefined;
    if (data.id && uuidRegex.test(data.id)) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: data.id },
      });
      if (existingProduct) {
        // Double submit detected: product already created. Return immediately.
        return this.getProductById(data.id);
      }
      validProductId = data.id;
    }

    let finalSlug = data.slug;
    const existing = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      finalSlug = `${data.slug}-${Math.random().toString(36).slice(2, 7)}`;
    }

    let validCategoryId: string | undefined = undefined;
    if (data.categoryId && uuidRegex.test(data.categoryId)) {
      const catExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (catExists) {
        validCategoryId = data.categoryId;
      }
    }

    let created;
    try {
      created = await prisma.$transaction(
        async (tx) => {
          const product = await tx.product.create({
            data: {
              id: validProductId,
              name: data.name,
              slug: finalSlug,
              description: data.description || null,
              shortDescription: data.shortDescription || null,
              productType: data.productType || null,
              status: data.status || ProductStatus.DRAFT,
              visibility: data.visibility || ProductVisibility.PUBLIC,
              basePrice:
                data.basePrice !== undefined && !isNaN(Number(data.basePrice))
                  ? Number(data.basePrice)
                  : 0,
              compareAtPrice:
                data.compareAtPrice !== undefined &&
                !isNaN(Number(data.compareAtPrice))
                  ? Number(data.compareAtPrice)
                  : null,
              careInstructions: data.careInstructions || null,
            },
          });

          if (validCategoryId) {
            await tx.productCategory.create({
              data: {
                productId: product.id,
                categoryId: validCategoryId,
                isPrimary: true,
              },
            });
          }

          const createdVariantIds: string[] = [];

          if (data.variants && data.variants.length > 0) {
            let colorAttr = await tx.attribute.findUnique({
              where: { slug: "color" },
            });
            if (!colorAttr) {
              colorAttr = await tx.attribute.create({
                data: {
                  name: "Color",
                  slug: "color",
                  isVariantAttribute: true,
                },
              });
            }

            let sizeAttr = await tx.attribute.findUnique({
              where: { slug: "size" },
            });
            if (!sizeAttr) {
              sizeAttr = await tx.attribute.create({
                data: { name: "Size", slug: "size", isVariantAttribute: true },
              });
            }

            const attrCache = new Map<string, string>();

            const incomingSkus = data.variants.map((v) => v.sku);
            const existingSkusInDb = await tx.productVariant.findMany({
              where: { sku: { in: incomingSkus } },
              select: { sku: true },
            });
            const dbSkuSet = new Set(existingSkusInDb.map((e) => e.sku));
            const usedSkus = new Set<string>();

            const variantAttrData: any[] = [];
            const inventoryData: any[] = [];

            for (const varItem of data.variants) {
              const colorSlug = slugify(varItem.colorName);
              const sizeSlug = slugify(varItem.sizeName);

              // 1. Resolve Color Attribute
              let colorValId = attrCache.get(`color_${colorSlug}`);
              if (!colorValId) {
                let colorValue = await tx.attributeValue.findFirst({
                  where: { attributeId: colorAttr.id, slug: colorSlug },
                });
                if (!colorValue) {
                  colorValue = await tx.attributeValue.create({
                    data: {
                      attributeId: colorAttr.id,
                      value: varItem.colorName,
                      slug: colorSlug,
                      colorHex: varItem.colorHex || null,
                    },
                  });
                } else if (varItem.colorHex && !colorValue.colorHex) {
                  await tx.attributeValue.update({
                    where: { id: colorValue.id },
                    data: { colorHex: varItem.colorHex },
                  });
                }
                colorValId = colorValue.id;
                attrCache.set(`color_${colorSlug}`, colorValId);
              }

              // 2. Resolve Size Attribute
              let sizeValId = attrCache.get(`size_${sizeSlug}`);
              if (!sizeValId) {
                let sizeValue = await tx.attributeValue.findFirst({
                  where: { attributeId: sizeAttr.id, slug: sizeSlug },
                });
                if (!sizeValue) {
                  sizeValue = await tx.attributeValue.create({
                    data: {
                      attributeId: sizeAttr.id,
                      value: varItem.sizeName,
                      slug: sizeSlug,
                    },
                  });
                }
                sizeValId = sizeValue.id;
                attrCache.set(`size_${sizeSlug}`, sizeValId);
              }

              // 3. Resolve SKU
              let finalSku = varItem.sku;
              if (dbSkuSet.has(finalSku) || usedSkus.has(finalSku)) {
                finalSku = `${finalSku}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
              }
              usedSkus.add(finalSku);

              // 4. Create Variant
              const createdVariant = await tx.productVariant.create({
                data: {
                  id:
                    varItem.id && uuidRegex.test(varItem.id)
                      ? varItem.id
                      : undefined,
                  productId: product.id,
                  sku: finalSku,
                  variantName: `${varItem.colorName} / ${varItem.sizeName}`,
                  price: varItem.price,
                  compareAtPrice: varItem.compareAtPrice || null,
                  isActive: varItem.isActive ?? true,
                },
              });

              createdVariantIds.push(createdVariant.id);

              // Queue up relations for bulk insert
              variantAttrData.push({
                variantId: createdVariant.id,
                attributeValueId: colorValId,
              });
              variantAttrData.push({
                variantId: createdVariant.id,
                attributeValueId: sizeValId,
              });

              inventoryData.push({
                variantId: createdVariant.id,
                quantityOnHand: varItem.stock ?? 0,
                quantityReserved: 0,
                reorderLevel: data.reorderLevel ?? 5,
              });
            }

            // Bulk Insert Relations
            if (variantAttrData.length > 0) {
              await tx.variantAttributeValue.createMany({
                data: variantAttrData,
              });
            }
            if (inventoryData.length > 0) {
              await tx.inventory.createMany({ data: inventoryData });
            }
          } else {
            // Standard default variant for simple products without custom variants
            let defaultSku = `${finalSlug.toUpperCase().replace(/[^A-Z0-9]/g, "")}-STD`;
            const existingDefaultSku = await tx.productVariant.findUnique({
              where: { sku: defaultSku },
            });
            if (existingDefaultSku) {
              defaultSku = `${defaultSku}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            }

            const createdVariant = await tx.productVariant.create({
              data: {
                productId: product.id,
                sku: defaultSku,
                variantName: "Standard",
                price: product.basePrice ? Number(product.basePrice) : 0,
                compareAtPrice: product.compareAtPrice
                  ? Number(product.compareAtPrice)
                  : undefined,
                isActive: true,
              },
            });

            createdVariantIds.push(createdVariant.id);

            await tx.inventory.create({
              data: {
                variantId: createdVariant.id,
                quantityOnHand: data.stockQuantity ?? 0,
                quantityReserved: 0,
                reorderLevel: data.reorderLevel ?? 5,
              },
            });
          }

          if (data.images && data.images.length > 0) {
            const validImgs = data.images.filter(
              (img) => img.imageUrl && !img.imageUrl.startsWith("blob:"),
            );
            for (let i = 0; i < validImgs.length; i++) {
              const img = validImgs[i];
              const createdImg = await tx.productImage.create({
                data: {
                  productId: product.id,
                  imageUrl: img.imageUrl,
                  altText: img.altText || null,
                  sortOrder: img.sortOrder ?? i,
                  isPrimary: img.isPrimary ?? i === 0,
                },
              });

              const vIdsToLink = (img.variantIds || []).filter((vId) =>
                createdVariantIds.includes(vId),
              );
              if (vIdsToLink.length > 0) {
                await tx.variantImage.createMany({
                  data: vIdsToLink.map((vId, sortIdx) => ({
                    variantId: vId,
                    imageId: createdImg.id,
                    sortOrder: sortIdx,
                  })),
                });
              }
            }
          }

          return product;
        },
        { timeout: 60000, maxWait: 20000 },
      );
    } catch (error: any) {
      if (error.code === "P2002" && validProductId) {
        // Double submit race condition: return the product that was just created
        const existing = await this.getProductById(validProductId);
        if (existing) return existing;
      }
      throw error;
    }

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
      stockQuantity?: number;
      reorderLevel?: number;
      careInstructions?: string;
      categoryId?: string;
      variants?: Array<{
        id?: string;
        sku: string;
        colorName: string;
        colorHex?: string | null;
        sizeName: string;
        price: number;
        compareAtPrice?: number | null;
        stock?: number;
        isActive?: boolean;
      }>;
    },
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: { include: { inventory: true } } },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (data.slug && data.slug !== product.slug) {
      const existing = await prisma.product.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        throw new ConflictError("A product with this slug already exists");
      }
    }

    await prisma.$transaction(
      async (tx) => {
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
          await tx.productCategory.deleteMany({
            where: { productId: id, isPrimary: true },
          });
          await tx.productCategory.create({
            data: {
              productId: id,
              categoryId: data.categoryId,
              isPrimary: true,
            },
          });
        }

        // Handle direct stockQuantity update if passed
        if (data.stockQuantity !== undefined && product.variants.length > 0) {
          for (const v of product.variants) {
            if (v.inventory) {
              await tx.inventory.update({
                where: { id: v.inventory.id },
                data: {
                  quantityOnHand: data.stockQuantity,
                  ...(data.reorderLevel !== undefined
                    ? { reorderLevel: data.reorderLevel }
                    : {}),
                },
              });
            } else {
              await tx.inventory.create({
                data: {
                  variantId: v.id,
                  quantityOnHand: data.stockQuantity,
                  quantityReserved: 0,
                  reorderLevel: data.reorderLevel ?? 5,
                },
              });
            }
          }
        }
      },
      { timeout: 60000, maxWait: 20000 },
    );

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
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
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
    },
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
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
    },
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
      const pathMatch = url.pathname.match(
        /\/storage\/v1\/object\/public\/[^/]+\/(.+)/,
      );
      if (pathMatch?.[1]) {
        await UploadService.deleteFile(pathMatch[1]);
      }
    } catch {
      // If URL parsing fails, skip storage deletion silently
    }

    return { id: imageId, deleted: true };
  }

  static async reorderImages(productId: string, orderedIds: string[]) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundError("Product not found");

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.productImage.updateMany({
          where: { id, productId },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.listImages(productId);
  }

  // ──────────────────────────────────────────────────────────
  // VARIANT CRUD
  // ──────────────────────────────────────────────────────────

  static async addVariant(
    productId: string,
    data: {
      sku: string;
      colorName: string;
      colorHex?: string | null;
      sizeName: string;
      price: number;
      compareAtPrice?: number | null;
      stock?: number;
      isActive?: boolean;
    },
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundError("Product not found");

    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });
    if (existingSku)
      throw new ConflictError("A variant with this SKU already exists");

    await prisma.$transaction(async (tx) => {
      let colorAttr = await tx.attribute.findUnique({
        where: { slug: "color" },
      });
      if (!colorAttr) {
        colorAttr = await tx.attribute.create({
          data: { name: "Color", slug: "color", isVariantAttribute: true },
        });
      }

      let sizeAttr = await tx.attribute.findUnique({ where: { slug: "size" } });
      if (!sizeAttr) {
        sizeAttr = await tx.attribute.create({
          data: { name: "Size", slug: "size", isVariantAttribute: true },
        });
      }

      const colorSlug = slugify(data.colorName);
      const sizeSlug = slugify(data.sizeName);

      let colorValue = await tx.attributeValue.findFirst({
        where: { attributeId: colorAttr.id, slug: colorSlug },
      });
      if (!colorValue) {
        colorValue = await tx.attributeValue.create({
          data: {
            attributeId: colorAttr.id,
            value: data.colorName,
            slug: colorSlug,
            colorHex: data.colorHex || null,
          },
        });
      } else if (data.colorHex && colorValue.colorHex !== data.colorHex) {
        await tx.attributeValue.update({
          where: { id: colorValue.id },
          data: { colorHex: data.colorHex },
        });
      }

      let sizeValue = await tx.attributeValue.findFirst({
        where: { attributeId: sizeAttr.id, slug: sizeSlug },
      });
      if (!sizeValue) {
        sizeValue = await tx.attributeValue.create({
          data: {
            attributeId: sizeAttr.id,
            value: data.sizeName,
            slug: sizeSlug,
          },
        });
      }

      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: data.sku,
          variantName: `${data.colorName} / ${data.sizeName}`,
          price: data.price,
          compareAtPrice: data.compareAtPrice || null,
          isActive: data.isActive ?? true,
        },
      });

      await tx.variantAttributeValue.createMany({
        data: [
          { variantId: variant.id, attributeValueId: colorValue.id },
          { variantId: variant.id, attributeValueId: sizeValue.id },
        ],
      });

      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantityOnHand: data.stock ?? 0,
          quantityReserved: 0,
          reorderLevel: 5,
        },
      });
    });

    return this.getProductById(productId);
  }

  static async updateVariant(
    productId: string,
    variantId: string,
    data: {
      sku?: string;
      colorName?: string;
      colorHex?: string | null;
      sizeName?: string;
      price?: number;
      compareAtPrice?: number | null;
      stock?: number;
      isActive?: boolean;
    },
  ) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundError("Variant not found");

    if (data.sku && data.sku !== variant.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku)
        throw new ConflictError("A variant with this SKU already exists");
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          ...(data.sku ? { sku: data.sku } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.compareAtPrice !== undefined
            ? { compareAtPrice: data.compareAtPrice }
            : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });

      if (data.stock !== undefined) {
        await tx.inventory.upsert({
          where: { variantId },
          update: { quantityOnHand: data.stock },
          create: {
            variantId,
            quantityOnHand: data.stock,
            quantityReserved: 0,
            reorderLevel: 5,
          },
        });
      }

      if (data.colorHex) {
        const colorVav = await tx.variantAttributeValue.findFirst({
          where: { variantId },
          include: { attributeValue: { include: { attribute: true } } },
        });
        if (colorVav?.attributeValue) {
          await tx.attributeValue.update({
            where: { id: colorVav.attributeValueId },
            data: { colorHex: data.colorHex },
          });
        }
      }
    });

    return this.getProductById(productId);
  }

  static async deleteVariant(productId: string, variantId: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundError("Variant not found");

    await prisma.productVariant.delete({ where: { id: variantId } });

    return { id: variantId, deleted: true };
  }
}
