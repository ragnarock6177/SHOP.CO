import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { parsePaginationParams, buildPaginationMeta } from "../utils/pagination.js";

export class ProductService {
  static async listProducts(query: {
    page?: string;
    limit?: string;
    category?: string;
    collection?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    selectionMode?: string;
    ids?: string | string[];
    colors?: string | string[];
    sizes?: string | string[];
    featured?: string | boolean;
    onSale?: string | boolean;
  }) {
    const { page, limit, skip } = parsePaginationParams(query.page, query.limit);

    const where: any = {
      status: "ACTIVE",
      visibility: "PUBLIC",
      deletedAt: null,
    };

    if (query.ids) {
      const idList = Array.isArray(query.ids)
        ? query.ids
        : String(query.ids).split(",").map((s) => s.trim()).filter(Boolean);
      if (idList.length > 0) {
        where.id = { in: idList };
      }
    }

    if (query.featured === true || query.featured === "true" || query.selectionMode === "FEATURED") {
      where.productCollections = {
        some: { collection: { slug: { in: ["new-arrivals", "best-sellers", "summer-2026", "urban-minimalist"] } } },
      };
    }

    if (query.onSale === true || query.onSale === "true" || query.selectionMode === "SALE") {
      where.compareAtPrice = { not: null };
    }

    if (query.category) {
      where.productCategories = {
        some: { category: { slug: query.category } },
      };
    }

    if (query.collection) {
      where.productCollections = {
        some: { collection: { slug: query.collection } },
      };
    }

    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.basePrice.lte = parseFloat(query.maxPrice);
    }

    if (query.colors) {
      const colorList = Array.isArray(query.colors)
        ? query.colors
        : String(query.colors).split(",").map((s) => s.trim()).filter(Boolean);
      if (colorList.length > 0) {
        where.variants = {
          some: {
            variantAttributeValues: {
              some: {
                attributeValue: {
                  value: { in: colorList, mode: "insensitive" },
                },
              },
            },
          },
        };
      }
    }

    if (query.sizes) {
      const sizeList = Array.isArray(query.sizes)
        ? query.sizes
        : String(query.sizes).split(",").map((s) => s.trim()).filter(Boolean);
      if (sizeList.length > 0) {
        where.variants = {
          ...(where.variants || {}),
          some: {
            ...(where.variants?.some || {}),
            variantAttributeValues: {
              some: {
                attributeValue: {
                  value: { in: sizeList, mode: "insensitive" },
                },
              },
            },
          },
        };
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { shortDescription: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
        { productCategories: { some: { category: { name: { contains: query.search, mode: "insensitive" } } } } },
      ];
    }

    const orderBy: any = {};
    let sortBy = query.sortBy || "createdAt";
    let sortOrder = (query.sortOrder || "desc").toLowerCase();

    if (query.selectionMode === "LATEST") {
      sortBy = "createdAt";
      sortOrder = "desc";
    } else if (query.selectionMode === "BEST_SELLING") {
      sortBy = "createdAt";
      sortOrder = "desc";
    }

    if (sortBy === "price-low") {
      orderBy["basePrice"] = "asc";
    } else if (sortBy === "price-high") {
      orderBy["basePrice"] = "desc";
    } else if (sortBy === "basePrice" || sortBy === "name" || sortBy === "createdAt") {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy["createdAt"] = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          status: true,
          createdAt: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { imageUrl: true, altText: true },
          },
          productCategories: {
            select: {
              isPrimary: true,
              category: { select: { id: true, name: true, slug: true } },
            },
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
    }));

    const meta = buildPaginationMeta(page, limit, total);
    return { data: formattedProducts, meta };
  }

  static async getProductDetailsBySlug(slug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const whereCondition: any = {
      status: "ACTIVE",
      visibility: "PUBLIC",
      deletedAt: null,
    };

    if (isUuid) {
      whereCondition.OR = [{ id: slug }, { slug }];
    } else {
      whereCondition.slug = slug;
    }

    const product = await prisma.product.findFirst({
      where: whereCondition,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
        productCategories: { include: { category: true } },
        variants: {
          where: { isActive: true, deletedAt: null },
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

    const formattedVariants = product.variants.map((v) => {
      const available = v.inventory
        ? Math.max(0, v.inventory.quantityOnHand - v.inventory.quantityReserved)
        : 0;

      return {
        id: v.id,
        sku: v.sku,
        barcode: v.barcode,
        variantName: v.variantName,
        price: v.price.toNumber(),
        compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toNumber() : null,
        weightGrams: v.weightGrams ? v.weightGrams.toNumber() : null,
        isDefault: v.isDefault,
        stockAvailable: available,
        attributes: v.variantAttributeValues.map((vav) => ({
          attributeSlug: vav.attributeValue.attribute.slug,
          attributeName: vav.attributeValue.attribute.name,
          valueSlug: vav.attributeValue.slug,
          value: vav.attributeValue.value,
          colorHex: vav.attributeValue.colorHex,
        })),
      };
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      productType: product.productType,
      basePrice: product.basePrice ? product.basePrice.toNumber() : null,
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toNumber() : null,
      currency: product.currency,
      careInstructions: product.careInstructions,
      images: product.images,
      videos: product.videos,
      variants: formattedVariants,
    };
  }
}
