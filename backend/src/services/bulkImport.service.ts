import { PrismaClient, ProductStatus, ProductVisibility, InventoryMovementType } from "@prisma/client";
import { parseSpreadsheetBuffer } from "./spreadsheetParser.service.js";
import {
  NormalizedImportRow,
  GroupedProductImport,
  ImportValidationSummary,
  ImportExecutionResult,
  FailedImportRow,
  ImportMode,
  RowDiagnostic,
} from "../types/bulkImport.js";

const prisma = new PrismaClient();

/**
 * Groups flat spreadsheet rows by handle/slug to construct parent products and their child variants.
 */
export function groupImportRows(rows: NormalizedImportRow[]): GroupedProductImport[] {
  const groupsMap = new Map<string, GroupedProductImport>();

  for (const row of rows) {
    const handle = (row.handle || row.productName || "item")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!groupsMap.has(handle)) {
      groupsMap.set(handle, {
        handle,
        name: row.productName || row.handle || "Untitled Product",
        slug: handle,
        description: row.description,
        categoryName: row.categoryName,
        brand: row.brand || "AIRAVÉ",
        status: row.status || "DRAFT",
        visibility: row.visibility === "HIDDEN" ? "HIDDEN" : "PUBLIC",
        basePrice: row.basePrice || 0,
        compareAtPrice: row.compareAtPrice,
        imageUrls: [...(row.imageUrls || [])],
        variants: [],
      });
    }

    const group = groupsMap.get(handle)!;

    // Accumulate unique images
    (row.imageUrls || []).forEach((url) => {
      if (url && !group.imageUrls.includes(url)) {
        group.imageUrls.push(url);
      }
    });

    // Update parent metadata if first row lacked it
    if (!group.description && row.description) group.description = row.description;
    if ((group.name === handle || !group.name) && row.productName) group.name = row.productName;

    // Add variant
    group.variants.push({
      sku: row.sku,
      name: row.variantName || (row.colorName && row.size ? `${row.colorName} / ${row.size}` : row.variantName || "Default"),
      price: row.variantPrice !== undefined ? row.variantPrice : row.basePrice,
      compareAtPrice: row.variantComparePrice !== undefined ? row.variantComparePrice : row.compareAtPrice,
      stockQuantity: row.stockQuantity ?? 0,
      colorName: row.colorName,
      colorHex: row.colorHex,
      size: row.size,
      attributes: row.attributes,
      barcode: row.barcode,
      imageUrls: [...(row.imageUrls || [])],
    });
  }

  return Array.from(groupsMap.values());
}

/**
 * Normalizes input: handles both raw binary spreadsheet Buffers or already-parsed row arrays.
 */
function resolveRows(input: Buffer | NormalizedImportRow[]): NormalizedImportRow[] {
  if (Array.isArray(input)) {
    return input.map((r, i) => ({
      ...r,
      rowIndex: r.rowIndex || i + 1,
      basePrice: Number(r.basePrice) || 0,
      variantPrice: r.variantPrice !== undefined ? Number(r.variantPrice) : undefined,
      compareAtPrice: r.compareAtPrice !== undefined ? Number(r.compareAtPrice) : undefined,
      variantComparePrice: r.variantComparePrice !== undefined ? Number(r.variantComparePrice) : undefined,
      stockQuantity: Number(r.stockQuantity) || 0,
      imageUrls: Array.isArray(r.imageUrls) ? r.imageUrls : [],
    }));
  }
  return parseSpreadsheetBuffer(input);
}

/**
 * Dry-run pre-import validation engine: checks errors, missing fields, category detection, duplicate SKUs.
 */
export async function validateSpreadsheetImport(
  input: Buffer | NormalizedImportRow[],
  options: { autoCreateCategories?: boolean; importMode?: ImportMode } = {}
): Promise<ImportValidationSummary> {
  const rows = resolveRows(input);
  const groupedProducts = groupImportRows(rows);

  const errors: RowDiagnostic[] = [];
  const warnings: RowDiagnostic[] = [];
  const seenSkusInFile = new Set<string>();

  // 1. Gather all existing SKUs from DB
  const allSkusInFile = rows.map((r) => r.sku).filter(Boolean);
  const existingVariantsInDb = await prisma.productVariant.findMany({
    where: { sku: { in: allSkusInFile } },
    select: { sku: true },
  });
  const existingDbSkuSet = new Set(existingVariantsInDb.map((v) => v.sku));

  // 2. Gather all categories
  const categoriesInDb = await prisma.category.findMany({
    select: { name: true, slug: true },
  });
  const dbCategoryNameSet = new Set(categoriesInDb.map((c) => c.name.toLowerCase()));

  const newCategoriesDetected = new Set<string>();
  let existingSkusCount = 0;
  let newSkusCount = 0;

  // Validate each row
  for (const row of rows) {
    // Required fields check
    if (!row.productName && !row.handle) {
      errors.push({
        row: row.rowIndex,
        handle: row.handle,
        sku: row.sku,
        field: "productName",
        message: "Product name or handle is required.",
      });
    }

    if (!row.sku) {
      errors.push({
        row: row.rowIndex,
        handle: row.handle,
        field: "sku",
        message: "SKU is required.",
      });
    } else {
      // In-file duplicate check
      if (seenSkusInFile.has(row.sku)) {
        errors.push({
          row: row.rowIndex,
          handle: row.handle,
          sku: row.sku,
          field: "sku",
          message: `Duplicate SKU "${row.sku}" found multiple times in this spreadsheet.`,
        });
      } else {
        seenSkusInFile.add(row.sku);
      }

      // DB existence check
      if (existingDbSkuSet.has(row.sku)) {
        existingSkusCount++;
        if (options.importMode === "INSERT_ONLY") {
          warnings.push({
            row: row.rowIndex,
            handle: row.handle,
            sku: row.sku,
            field: "sku",
            message: `SKU "${row.sku}" already exists in the catalog and will be skipped in INSERT_ONLY mode.`,
          });
        }
      } else {
        newSkusCount++;
      }
    }

    // Pricing checks
    if (row.basePrice < 0) {
      errors.push({
        row: row.rowIndex,
        handle: row.handle,
        sku: row.sku,
        field: "basePrice",
        message: "Base price cannot be negative.",
      });
    }

    if (row.variantPrice !== undefined && row.variantPrice < 0) {
      errors.push({
        row: row.rowIndex,
        handle: row.handle,
        sku: row.sku,
        field: "variantPrice",
        message: "Variant price cannot be negative.",
      });
    }

    // Stock checks
    if (row.stockQuantity < 0) {
      errors.push({
        row: row.rowIndex,
        handle: row.handle,
        sku: row.sku,
        field: "stockQuantity",
        message: "Stock quantity cannot be negative.",
      });
    }

    // Category checks
    if (row.categoryName) {
      const topCat = row.categoryName.split(">")[0].trim();
      if (!dbCategoryNameSet.has(topCat.toLowerCase())) {
        newCategoriesDetected.add(topCat);
        if (!options.autoCreateCategories) {
          warnings.push({
            row: row.rowIndex,
            handle: row.handle,
            field: "categoryName",
            message: `Category "${topCat}" does not exist in catalog. Enable auto-create or create it first.`,
          });
        }
      }
    }
  }

  return {
    totalRows: rows.length,
    totalProducts: groupedProducts.length,
    totalVariants: rows.length,
    newCategories: Array.from(newCategoriesDetected),
    existingSkusCount,
    newSkusCount,
    isValid: errors.length === 0,
    warnings,
    errors,
    normalizedRows: rows,
  };
}

/**
 * Executes the full batch import / upsert with pre-created attributes and stable transactions.
 */
export async function executeSpreadsheetImport(
  input: Buffer | NormalizedImportRow[],
  options: {
    autoCreateCategories?: boolean;
    importMode?: ImportMode;
    skipInvalidRows?: boolean;
    adminUserId?: string;
  } = {}
): Promise<ImportExecutionResult> {
  const rows = resolveRows(input);
  const groupedProducts = groupImportRows(rows);

  let totalProductsCreated = 0;
  let totalProductsUpdated = 0;
  let totalVariantsCreated = 0;
  let totalVariantsUpdated = 0;
  let totalStockUnitsAdded = 0;
  const failedRows: FailedImportRow[] = [];

  // 1. PRE-POPULATE CATEGORIES (Outside product transactions)
  const categoryCache = new Map<string, string>();
  const existingCategories = await prisma.category.findMany({ select: { id: true, name: true } });
  existingCategories.forEach((c) => categoryCache.set(c.name.toLowerCase().trim(), c.id));

  for (const group of groupedProducts) {
    if (group.categoryName) {
      const cleanName = group.categoryName.split(">")[0].trim();
      const lower = cleanName.toLowerCase();
      if (!categoryCache.has(lower) && options.autoCreateCategories !== false) {
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const created = await prisma.category.create({
          data: {
            name: cleanName,
            slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
            status: "ACTIVE",
          },
        });
        categoryCache.set(lower, created.id);
      }
    }
  }

  // 2. PRE-POPULATE ATTRIBUTES & ATTRIBUTE VALUES (Outside product transactions)
  const attributeCache = new Map<string, { id: string; name: string }>();
  const attrValueCache = new Map<string, string>(); // `${attrSlug}:${valSlug}` -> attrValId

  const dbAttributes = await prisma.attribute.findMany({
    include: { values: true },
  });
  for (const attr of dbAttributes) {
    attributeCache.set(attr.slug, { id: attr.id, name: attr.name });
    for (const val of attr.values) {
      attrValueCache.set(`${attr.slug}:${val.slug}`, val.id);
    }
  }

  const ensureAttributeValue = async (attrName: string, value: string, colorHex?: string): Promise<string | null> => {
    if (!attrName || !value) return null;
    const attrSlug = attrName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const valSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const compositeKey = `${attrSlug}:${valSlug}`;

    if (attrValueCache.has(compositeKey)) {
      return attrValueCache.get(compositeKey)!;
    }

    let attr = attributeCache.get(attrSlug);
    if (!attr) {
      const createdAttr = await prisma.attribute.create({
        data: {
          name: attrName,
          slug: attrSlug,
          isVariantAttribute: true,
          isFilterable: true,
        },
      });
      attr = { id: createdAttr.id, name: createdAttr.name };
      attributeCache.set(attrSlug, attr);
    }

    let attrVal = await prisma.attributeValue.findFirst({
      where: { attributeId: attr.id, slug: valSlug },
    });
    if (!attrVal) {
      attrVal = await prisma.attributeValue.create({
        data: {
          attributeId: attr.id,
          value,
          slug: valSlug,
          colorHex: colorHex || (attrName.toLowerCase().includes("color") ? "#000000" : undefined),
        },
      });
    }

    attrValueCache.set(compositeKey, attrVal.id);
    return attrVal.id;
  };

  // Pre-resolve all attributes needed in this import
  for (const group of groupedProducts) {
    for (const v of group.variants) {
      if (v.colorName) await ensureAttributeValue("Color", v.colorName, v.colorHex);
      if (v.size) await ensureAttributeValue("Size", v.size);
      if (v.attributes) {
        for (const [k, val] of Object.entries(v.attributes)) {
          await ensureAttributeValue(k, val);
        }
      }
    }
  }

  // Verify adminUserId exists in User table if provided
  let validAdminUserId: string | undefined = undefined;
  if (options.adminUserId) {
    const adminUser = await prisma.user.findUnique({
      where: { id: options.adminUserId },
      select: { id: true },
    }).catch(() => null);
    if (adminUser) validAdminUserId = adminUser.id;
  }

  // 3. EXECUTE PRODUCTS & VARIANTS IMPORT
  for (const group of groupedProducts) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const categoryId = group.categoryName
            ? categoryCache.get(group.categoryName.split(">")[0].trim().toLowerCase())
            : undefined;

          // Find or create Parent Product
          let product = await tx.product.findUnique({
            where: { slug: group.slug },
            select: { id: true, description: true },
          });

          if (!product) {
            product = await tx.product.create({
              data: {
                name: group.name,
                slug: group.slug,
                description: group.description,
                status: group.status as ProductStatus,
                visibility: (group.visibility === "HIDDEN" ? "HIDDEN" : "PUBLIC") as ProductVisibility,
                basePrice: group.basePrice,
                compareAtPrice: group.compareAtPrice,
                currency: "INR",
                ...(categoryId
                  ? {
                      productCategories: {
                        create: { categoryId, isPrimary: true },
                      },
                    }
                  : {}),
              },
              select: { id: true, description: true },
            });
            totalProductsCreated++;
          } else if (options.importMode === "UPSERT") {
            product = await tx.product.update({
              where: { id: product.id },
              data: {
                name: group.name,
                description: group.description || product.description,
                basePrice: group.basePrice,
                compareAtPrice: group.compareAtPrice,
                status: group.status as ProductStatus,
                visibility: (group.visibility === "HIDDEN" ? "HIDDEN" : "PUBLIC") as ProductVisibility,
              },
              select: { id: true, description: true },
            });
            totalProductsUpdated++;
          }

          // Register Product Images
          if (group.imageUrls.length > 0) {
            for (let i = 0; i < group.imageUrls.length; i++) {
              const imgUrl = group.imageUrls[i];
              const exists = await tx.productImage.findFirst({
                where: { productId: product.id, imageUrl: imgUrl },
                select: { id: true },
              });
              if (!exists) {
                await tx.productImage.create({
                  data: {
                    productId: product.id,
                    imageUrl: imgUrl,
                    isPrimary: i === 0,
                    sortOrder: i,
                  },
                });
              }
            }
          }

          // Process Variants
          for (let vIdx = 0; vIdx < group.variants.length; vIdx++) {
            const vData = group.variants[vIdx];
            const isDefault = vIdx === 0;

            const existingVariant = await tx.productVariant.findUnique({
              where: { sku: vData.sku },
              include: { inventory: true },
            });

            if (!existingVariant) {
              // Create Variant
              const newVariant = await tx.productVariant.create({
                data: {
                  productId: product.id,
                  sku: vData.sku,
                  variantName: vData.name || "Default",
                  price: vData.price,
                  compareAtPrice: vData.compareAtPrice,
                  barcode: vData.barcode,
                  isDefault,
                  isActive: true,
                },
              });
              totalVariantsCreated++;

              // Create Inventory & Movement
              if (vData.stockQuantity >= 0) {
                await tx.inventory.create({
                  data: {
                    variantId: newVariant.id,
                    quantityOnHand: vData.stockQuantity,
                    quantityReserved: 0,
                    reorderLevel: 5,
                  },
                });

                await tx.inventoryMovement.create({
                  data: {
                    variantId: newVariant.id,
                    movementType: InventoryMovementType.INITIAL,
                    quantity: vData.stockQuantity,
                    notes: "Bulk Catalog Spreadsheet Ingestion",
                    createdBy: validAdminUserId,
                  },
                });
                totalStockUnitsAdded += vData.stockQuantity;
              }

              // Link variant attributes
              const attrValIds: string[] = [];
              if (vData.colorName) {
                const id = attrValueCache.get(`color:${vData.colorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                if (id) attrValIds.push(id);
              }
              if (vData.size) {
                const id = attrValueCache.get(`size:${vData.size.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                if (id) attrValIds.push(id);
              }
              if (vData.attributes) {
                for (const [k, val] of Object.entries(vData.attributes)) {
                  const id = attrValueCache.get(`${k.toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${val.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                  if (id) attrValIds.push(id);
                }
              }

              for (const valId of attrValIds) {
                await tx.variantAttributeValue.create({
                  data: { variantId: newVariant.id, attributeValueId: valId },
                }).catch(() => {});
              }
            } else if (options.importMode === "UPSERT") {
              // Update Variant
              await tx.productVariant.update({
                where: { id: existingVariant.id },
                data: {
                  variantName: vData.name || existingVariant.variantName,
                  price: vData.price,
                  compareAtPrice: vData.compareAtPrice,
                  barcode: vData.barcode || existingVariant.barcode,
                },
              });
              totalVariantsUpdated++;

              // Update Inventory
              if (vData.stockQuantity >= 0 && existingVariant.inventory) {
                const oldQty = existingVariant.inventory.quantityOnHand;
                const diff = vData.stockQuantity - oldQty;

                if (diff !== 0) {
                  await tx.inventory.update({
                    where: { variantId: existingVariant.id },
                    data: { quantityOnHand: vData.stockQuantity },
                  });

                  await tx.inventoryMovement.create({
                    data: {
                      variantId: existingVariant.id,
                      movementType: InventoryMovementType.ADJUSTMENT,
                      quantity: diff,
                      notes: "Bulk Catalog Spreadsheet Sync",
                      createdBy: validAdminUserId,
                    },
                  });
                  totalStockUnitsAdded += Math.max(0, diff);
                }
              }
            }
          }
        },
        {
          maxWait: 15000,
          timeout: 60000,
        }
      );
    } catch (err: any) {
      group.variants.forEach((v) => {
        failedRows.push({
          row: 0,
          handle: group.handle,
          sku: v.sku,
          reason: err?.message || "Transaction aborted during insertion",
          rawData: {
            Handle: group.handle,
            "Product Name": group.name,
            SKU: v.sku,
            Price: v.price,
            Stock: v.stockQuantity,
          },
        });
      });
    }
  }

  return {
    totalProductsCreated,
    totalProductsUpdated,
    totalVariantsCreated,
    totalVariantsUpdated,
    totalStockUnitsAdded,
    failedCount: failedRows.length,
    failedRows,
  };
}
