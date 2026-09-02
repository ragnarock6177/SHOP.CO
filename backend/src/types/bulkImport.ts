export type ImportMode = "INSERT_ONLY" | "UPSERT";

export interface RawSpreadsheetRow {
  [key: string]: any;
}

export interface NormalizedImportRow {
  rowIndex: number;
  handle: string;
  productName: string;
  description?: string;
  categoryName: string;
  brand?: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  visibility: "PUBLIC" | "HIDDEN";
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
  imageUrls: string[];
}

export interface GroupedProductImport {
  handle: string;
  name: string;
  slug: string;
  description?: string;
  categoryName: string;
  brand: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  visibility: "PUBLIC" | "HIDDEN";
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

export interface RowDiagnostic {
  row: number;
  handle?: string;
  sku?: string;
  field?: string;
  message: string;
}

export interface ImportValidationSummary {
  totalRows: number;
  totalProducts: number;
  totalVariants: number;
  newCategories: string[];
  existingSkusCount: number;
  newSkusCount: number;
  isValid: boolean;
  warnings: RowDiagnostic[];
  errors: RowDiagnostic[];
  normalizedRows: NormalizedImportRow[];
}

export interface FailedImportRow {
  row: number;
  sku: string;
  handle: string;
  reason: string;
  rawData: Record<string, any>;
}

export interface ImportExecutionResult {
  totalProductsCreated: number;
  totalProductsUpdated: number;
  totalVariantsCreated: number;
  totalVariantsUpdated: number;
  totalStockUnitsAdded: number;
  failedCount: number;
  failedRows: FailedImportRow[];
}
