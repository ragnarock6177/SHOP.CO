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
  }) {
    const { page, limit, skip } = parsePaginationParams(query.page, query.limit);

    const where: any = {
      status: "ACTIVE",
      visibility: "PUBLIC",
      deletedAt: null,
    };

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

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = (query.sortOrder || "desc").toLowerCase();
    orderBy[sortBy] = sortOrder;

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
    const product = await prisma.product.findFirst({
      where: {
        status: "ACTIVE",
        visibility: "PUBLIC",
        deletedAt: null,
        OR: isUuid ? [{ id: slug }, { slug }] : [{ slug }, { id: slug }],
      },
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
