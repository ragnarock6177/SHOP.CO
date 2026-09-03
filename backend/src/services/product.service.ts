import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { parsePaginationParams, buildPaginationMeta } from "../utils/pagination.js";
import { getExpandedSearchTokens } from "../utils/dynamicSearch.js";

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

    // ── 100% Dynamic Multi-Token & Database Taxonomy Search Engine ──────
    if (query.search && query.search.trim()) {
      const expandedTokenGroups = await getExpandedSearchTokens(query.search);

      const tokenClauses = expandedTokenGroups.map((synonyms) => {
        return {
          OR: synonyms.flatMap((term) => [
            { name: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
            { productType: { contains: term, mode: "insensitive" } },
            { shortDescription: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { productCategories: { some: { category: { name: { contains: term, mode: "insensitive" } } } } },
            { productCollections: { some: { collection: { name: { contains: term, mode: "insensitive" } } } } },
            {
              variants: {
                some: {
                  OR: [
                    { variantName: { contains: term, mode: "insensitive" } },
                    {
                      variantAttributeValues: {
                        some: {
                          attributeValue: {
                            value: { contains: term, mode: "insensitive" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ]),
        };
      });

      if (tokenClauses.length > 0) {
        where.AND = [...(where.AND || []), ...tokenClauses];
      }
    }

    const orderBy: any = {};
    let sortBy = query.sortBy || (query.search ? "relevance" : "createdAt");
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
    } else if (sortBy !== "relevance") {
      orderBy["createdAt"] = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: sortBy === "relevance" ? 0 : skip,
        take: sortBy === "relevance" ? 100 : limit,
        orderBy: sortBy === "relevance" ? undefined : orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          productType: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          status: true,
          createdAt: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 2,
            select: { imageUrl: true, altText: true, isPrimary: true },
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
              variantName: true,
              price: true,
              compareAtPrice: true,
              inventory: { select: { quantityOnHand: true, quantityReserved: true } },
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

    let formattedProducts = products.map((p) => {
      const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
      const hoverImg = p.images[1] || primaryImg;

      return {
        ...p,
        basePrice: p.basePrice ? p.basePrice.toNumber() : null,
        compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
        primaryImage: primaryImg?.imageUrl || null,
        hoverImage: hoverImg?.imageUrl || null,
        variants: p.variants.map((v) => {
          const colorVal = v.variantAttributeValues.find(
            (vav) =>
              vav.attributeValue.attribute?.slug === "color" ||
              Boolean(vav.attributeValue.colorHex)
          )?.attributeValue;
          const sizeVal = v.variantAttributeValues.find(
            (vav) => vav.attributeValue.attribute?.slug === "size"
          )?.attributeValue;
          const stockAvailable = Math.max(
            0,
            (v.inventory?.quantityOnHand || 0) - (v.inventory?.quantityReserved || 0)
          );

          return {
            id: v.id,
            price: v.price.toNumber(),
            compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toNumber() : null,
            colorName: colorVal?.value || null,
            colorHex: colorVal?.colorHex || null,
            sizeName: sizeVal?.value || null,
            stockAvailable,
          };
        }),
      };
    });

    // ── Relevance Scoring (Rerank when searching) ────────────────────────
    if (query.search && query.search.trim()) {
      const searchTerms = query.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const exactPhrase = query.search.trim().toLowerCase();

      const scoredProducts = formattedProducts.map((p) => {
        let score = 0;
        const nameLower = p.name.toLowerCase();
        const slugLower = p.slug.toLowerCase();
        const typeLower = (p.productType || "").toLowerCase();
        const catNames = p.productCategories.map((pc) => pc.category.name.toLowerCase()).join(" ");

        // 1. Exact phrase in name (+120)
        if (nameLower.includes(exactPhrase)) score += 120;
        if (slugLower.includes(exactPhrase.replace(/\s+/g, "-"))) score += 100;

        // 2. Token matches across dimensions
        for (const term of searchTerms) {
          if (nameLower.includes(term)) score += 40;
          if (typeLower.includes(term)) score += 30;
          if (catNames.includes(term)) score += 25;

          const hasColorMatch = p.variants.some((v) =>
            v.colorName?.toLowerCase().includes(term)
          );
          if (hasColorMatch) score += 35;

          const hasSizeMatch = p.variants.some((v) =>
            v.sizeName?.toLowerCase() === term
          );
          if (hasSizeMatch) score += 20;

          if (p.shortDescription?.toLowerCase().includes(term)) score += 10;
        }

        return { ...p, _relevanceScore: score };
      });

      scoredProducts.sort((a, b) => b._relevanceScore - a._relevanceScore);
      formattedProducts = scoredProducts.slice(skip, skip + limit);
    }

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

  static async getDynamicFilters() {
    // 1. Fetch live active products with variants, attribute values, categories, and prices
    const activeProducts = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        visibility: "PUBLIC",
        deletedAt: null,
      },
      select: {
        basePrice: true,
        productCategories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        productCollections: {
          select: {
            collection: { select: { id: true, name: true, slug: true } },
          },
        },
        variants: {
          where: { isActive: true, deletedAt: null },
          select: {
            inventory: { select: { quantityOnHand: true, quantityReserved: true } },
            variantAttributeValues: {
              select: {
                attributeValue: {
                  select: {
                    value: true,
                    slug: true,
                    colorHex: true,
                    attribute: { select: { slug: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Extract dynamic Price bounds
    let minPrice = 0;
    let maxPrice = 5000;
    const prices = activeProducts
      .map((p) => (p.basePrice ? p.basePrice.toNumber() : 0))
      .filter((pr) => pr > 0);

    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
      maxPrice = Math.ceil(maxPrice / 100) * 100;
    }

    // 3. Extract dynamic available Colors, Sizes, Categories & Collections
    const colorMap = new Map<string, { name: string; hex: string; count: number }>();
    const sizeMap = new Map<string, { name: string; count: number }>();
    const categoryMap = new Map<string, { id: string; name: string; slug: string; count: number }>();
    const collectionMap = new Map<string, { id: string; name: string; slug: string; count: number }>();

    activeProducts.forEach((p) => {
      // Categories count
      p.productCategories.forEach((pc) => {
        const cat = pc.category;
        const existing = categoryMap.get(cat.slug) || { id: cat.id, name: cat.name, slug: cat.slug, count: 0 };
        existing.count += 1;
        categoryMap.set(cat.slug, existing);
      });

      // Collections count
      p.productCollections.forEach((pcol) => {
        const col = pcol.collection;
        const existing = collectionMap.get(col.slug) || { id: col.id, name: col.name, slug: col.slug, count: 0 };
        existing.count += 1;
        collectionMap.set(col.slug, existing);
      });

      // Variants Colors and Sizes with stock availability
      p.variants.forEach((v) => {
        const availableStock = Math.max(
          0,
          (v.inventory?.quantityOnHand || 0) - (v.inventory?.quantityReserved || 0)
        );

        v.variantAttributeValues.forEach((vav) => {
          const attrSlug = vav.attributeValue.attribute?.slug?.toLowerCase();
          const val = vav.attributeValue.value;
          const hex = vav.attributeValue.colorHex;

          if (attrSlug === "color" || hex) {
            const key = val.toLowerCase();
            const existing = colorMap.get(key) || { name: val, hex: hex || "#000000", count: 0 };
            if (availableStock > 0) existing.count += 1;
            colorMap.set(key, existing);
          } else if (attrSlug === "size" || attrSlug === "top-size" || attrSlug === "pant-size") {
            const key = val.toUpperCase();
            const existing = sizeMap.get(key) || { name: val, count: 0 };
            if (availableStock > 0) existing.count += 1;
            sizeMap.set(key, existing);
          }
        });
      });
    });

    // Custom size sorting order (XS, S, M, L, XL, XXL, 28, 30, 32, 34, 36, 38, etc.)
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38", "40"];
    const sortedSizes = Array.from(sizeMap.values()).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a.name.toUpperCase());
      const idxB = sizeOrder.indexOf(b.name.toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      minPrice,
      maxPrice: Math.max(maxPrice, 1000),
      availableColors: Array.from(colorMap.values()),
      availableSizes: sortedSizes.map((s) => s.name),
      categories: Array.from(categoryMap.values()),
      collections: Array.from(collectionMap.values()),
    };
  }
}
