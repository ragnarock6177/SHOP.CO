# Data Model: Bulk Product & Variant Import

**Feature**: `006-bulk-product-import`  
**Date**: 2026-09-02  
**Status**: Ready

## 1. Import Entity & Schema Definitions

### Import Row Schema (Spreadsheet Columns)

| Column Header | Type | Required | Description / Example |
|---|---|---|---|
| `Handle` | String | Yes | Unique product grouping key (e.g. `oversized-tee-monochrome`) |
| `Title` / `Product Name` | String | Yes (1st row) | Full product name (e.g. `Oversized Heavyweight T-Shirt`) |
| `Description` | String | Optional | HTML / Markdown or plain text description |
| `Category` | String | Yes | Category hierarchy path or name (e.g. `Apparel > T-Shirts`) |
| `Brand` | String | Optional | Brand name (default: `AIRAVÉ`) |
| `Status` | Enum | Optional | `DRAFT` \| `ACTIVE` \| `ARCHIVED` (default: `DRAFT`) |
| `Visibility` | Enum | Optional | `PUBLISHED` \| `HIDDEN` (default: `PUBLISHED`) |
| `Base Price` | Decimal | Yes | Main listing price (e.g. `2499.00`) |
| `Compare At Price` | Decimal | Optional | Original/strikeout MSRP price (e.g. `3499.00`) |
| `SKU` | String | Yes | Unique variant SKU code (e.g. `ARV-TEE-BLK-S`) |
| `Variant Name` | String | Optional | e.g. `Black / S` |
| `Variant Price` | Decimal | Optional | Override price if variant differs from base price |
| `Variant Compare Price` | Decimal | Optional | Override compare price |
| `Stock Quantity` | Integer | Yes | Initial inventory units (e.g. `50`) |
| `Color` | String | Optional | Color name (e.g. `Obsidian Black`) |
| `Color Hex` | String | Optional | Color hex code (e.g. `#0B0B0B`) |
| `Size` | String | Optional | Size standard (e.g. `S`, `M`, `L`, `XL`, `XXL`) |
| `Attributes` | String | Optional | Semicolon-delimited `Key:Value` (e.g. `Material:100% French Terry;Gender:Unisex`) |
| `Barcode` / `EAN` | String | Optional | UPC / EAN barcode string |
| `Image URLs` | String | Optional | Comma-separated public image URLs |

---

## 2. Ingestion Data Structures (Backend & State)

```typescript
export interface ParsedVariantRow {
  rowIndex: number;
  handle: string;
  productName: string;
  description?: string;
  categoryName: string;
  brand?: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  visibility: "PUBLISHED" | "HIDDEN";
  basePrice: number;
  compareAtPrice?: number;
  sku: string;
  variantName?: string;
  variantPrice?: number;
  variantComparePrice?: number;
  stockQuantity: number;
  colorName?: string;
  colorHex?: string;
  size?: string;
  attributes?: Record<string, string>;
  barcode?: string;
  imageUrls?: string[];
}

export interface GroupedProductImport {
  handle: string;
  name: string;
  slug: string;
  description?: string;
  categoryName: string;
  brand?: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  visibility: "PUBLISHED" | "HIDDEN";
  basePrice: number;
  compareAtPrice?: number;
  imageUrls: string[];
  variants: Array<{
    sku: string;
    name?: string;
    price: number;
    compareAtPrice?: number;
    stockQuantity: number;
    colorName?: string;
    colorHex?: string;
    size?: string;
    attributes?: Record<string, string>;
    barcode?: string;
    imageUrls: string[];
  }>;
}

export interface ImportValidationSummary {
  totalRows: number;
  totalProducts: number;
  totalVariants: number;
  newCategories: string[];
  existingSkusCount: number;
  newSkusCount: number;
  isValid: boolean;
  warnings: Array<{
    row: number;
    sku?: string;
    field: string;
    message: string;
  }>;
  errors: Array<{
    row: number;
    sku?: string;
    field: string;
    message: string;
  }>;
}

export interface ImportExecutionResult {
  jobId: string;
  totalProductsCreated: number;
  totalProductsUpdated: number;
  totalVariantsCreated: number;
  totalVariantsUpdated: number;
  totalStockUnitsAdded: number;
  failedCount: number;
  failedRows: Array<{
    row: number;
    sku: string;
    handle: string;
    reason: string;
    rawData: Record<string, any>;
  }>;
}
```
