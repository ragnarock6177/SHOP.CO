import * as XLSX from "xlsx";
import { NormalizedImportRow } from "../types/bulkImport.js";

/**
 * Normalizes header keys across various spreadsheet conventions.
 */
function normalizeKey(key: string): string {
  const clean = key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  
  if (["handle", "slug", "productslug", "producthandle", "groupid"].includes(clean)) return "handle";
  if (["title", "productname", "name", "producttitle"].includes(clean)) return "productName";
  if (["description", "body", "desc", "details"].includes(clean)) return "description";
  if (["category", "categoryname", "collection", "type"].includes(clean)) return "categoryName";
  if (["brand", "vendor", "manufacturer"].includes(clean)) return "brand";
  if (["status", "productstatus"].includes(clean)) return "status";
  if (["visibility", "publishstatus", "ispublished"].includes(clean)) return "visibility";
  if (["baseprice", "price", "mrp", "productprice", "cost"].includes(clean)) return "basePrice";
  if (["compareatprice", "compareprice", "originalprice", "strikeprice"].includes(clean)) return "compareAtPrice";
  if (["sku", "variantsku", "itemcode", "productcode"].includes(clean)) return "sku";
  if (["variantname", "varianttitle", "options"].includes(clean)) return "variantName";
  if (["variantprice", "optionprice"].includes(clean)) return "variantPrice";
  if (["variantcompareprice", "optioncompareprice"].includes(clean)) return "variantComparePrice";
  if (["stockquantity", "stock", "quantity", "qty", "inventory", "inventorycount"].includes(clean)) return "stockQuantity";
  if (["color", "colorname", "colour"].includes(clean)) return "colorName";
  if (["colorhex", "hex", "colourhex"].includes(clean)) return "colorHex";
  if (["size", "sizename", "option1"].includes(clean)) return "size";
  if (["attributes", "specs", "specifications", "properties"].includes(clean)) return "attributes";
  if (["barcode", "ean", "upc", "isbn"].includes(clean)) return "barcode";
  if (["imageurls", "images", "imageurl", "image", "photos"].includes(clean)) return "imageUrls";

  return key.trim();
}

/**
 * Parses raw Attributes column string (e.g. "Material:100% Cotton;Gender:Unisex") into key-value map.
 */
function parseAttributesString(attrStr?: string): Record<string, string> {
  if (!attrStr || typeof attrStr !== "string") return {};
  const map: Record<string, string> = {};
  
  attrStr.split(/[;,]/).forEach((pair) => {
    const [rawKey, rawVal] = pair.split(":");
    if (rawKey && rawVal) {
      map[rawKey.trim()] = rawVal.trim();
    }
  });

  return map;
}

/**
 * Parses raw CSV or Excel file buffer into strongly typed, normalized import rows.
 */
export function parseSpreadsheetBuffer(buffer: Buffer): NormalizedImportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Spreadsheet contains no sheets or readable data.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (!rawRows || rawRows.length === 0) {
    throw new Error("Spreadsheet is empty or headers could not be found.");
  }

  const normalizedRows: NormalizedImportRow[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Accounting for 1-based index and header row
    const normalizedData: Record<string, any> = {};

    Object.keys(row).forEach((rawKey) => {
      const standardKey = normalizeKey(rawKey);
      normalizedData[standardKey] = row[rawKey];
    });

    const handle = String(normalizedData.handle || normalizedData.productName || `product-${rowNum}`)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const productName = String(normalizedData.productName || normalizedData.handle || "").trim();
    const categoryName = String(normalizedData.categoryName || "Uncategorized").trim();
    const sku = String(normalizedData.sku || `${handle}-${rowNum}`).trim();

    // Parse status and visibility
    const rawStatus = String(normalizedData.status || "DRAFT").toUpperCase().trim();
    const status = (["ACTIVE", "ARCHIVED", "DRAFT"].includes(rawStatus) ? rawStatus : "DRAFT") as "DRAFT" | "ACTIVE" | "ARCHIVED";

    const rawVis = String(normalizedData.visibility || "PUBLIC").toUpperCase().trim();
    const visibility = (rawVis === "HIDDEN" ? "HIDDEN" : "PUBLIC") as "PUBLIC" | "HIDDEN";

    // Numerical parsing
    const basePrice = Math.max(0, parseFloat(String(normalizedData.basePrice || "0").replace(/[^0-9.]/g, "")) || 0);
    const compareAtPrice = normalizedData.compareAtPrice
      ? Math.max(0, parseFloat(String(normalizedData.compareAtPrice).replace(/[^0-9.]/g, "")) || 0)
      : undefined;

    const variantPrice = normalizedData.variantPrice
      ? Math.max(0, parseFloat(String(normalizedData.variantPrice).replace(/[^0-9.]/g, "")) || 0)
      : undefined;

    const variantComparePrice = normalizedData.variantComparePrice
      ? Math.max(0, parseFloat(String(normalizedData.variantComparePrice).replace(/[^0-9.]/g, "")) || 0)
      : undefined;

    const stockQuantity = Math.max(0, parseInt(String(normalizedData.stockQuantity || "0").replace(/[^0-9-]/g, ""), 10) || 0);

    // Image URLs
    const rawImages = String(normalizedData.imageUrls || "").trim();
    const imageUrls = rawImages
      ? rawImages.split(/[\n,;]+/).map((u) => u.trim()).filter((u) => u.startsWith("http://") || u.startsWith("https://"))
      : [];

    const attributes = parseAttributesString(normalizedData.attributes);

    normalizedRows.push({
      rowIndex: rowNum,
      handle,
      productName,
      description: normalizedData.description ? String(normalizedData.description).trim() : undefined,
      categoryName,
      brand: normalizedData.brand ? String(normalizedData.brand).trim() : "AIRAVÉ",
      status,
      visibility,
      basePrice,
      compareAtPrice,
      sku,
      variantName: normalizedData.variantName ? String(normalizedData.variantName).trim() : undefined,
      variantPrice,
      variantComparePrice,
      stockQuantity,
      colorName: normalizedData.colorName ? String(normalizedData.colorName).trim() : undefined,
      colorHex: normalizedData.colorHex ? String(normalizedData.colorHex).trim() : undefined,
      size: normalizedData.size ? String(normalizedData.size).trim() : undefined,
      attributes,
      barcode: normalizedData.barcode ? String(normalizedData.barcode).trim() : undefined,
      imageUrls,
    });
  });

  return normalizedRows;
}
