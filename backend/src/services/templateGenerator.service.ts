import * as XLSX from "xlsx";
import { FailedImportRow } from "../types/bulkImport.js";

const TEMPLATE_HEADERS = [
  "Handle",
  "Product Name",
  "Description",
  "Category",
  "Brand",
  "Status",
  "Visibility",
  "Base Price",
  "Compare At Price",
  "SKU",
  "Variant Name",
  "Variant Price",
  "Variant Compare Price",
  "Stock Quantity",
  "Color",
  "Color Hex",
  "Size",
  "Attributes",
  "Barcode",
  "Image URLs",
];

const SAMPLE_ROWS = [
  // Product 1: Multi-variant Luxury Heavyweight Hoodie (Black colorway)
  {
    "Handle": "oversized-heavyweight-hoodie",
    "Product Name": "Oversized Heavyweight Hoodie",
    "Description": "Crafted from 480 GSM organic cotton fleece with dropped shoulders and double-layered hood.",
    "Category": "Apparel > Hoodies",
    "Brand": "AIRAVÉ",
    "Status": "ACTIVE",
    "Visibility": "PUBLISHED",
    "Base Price": 4999,
    "Compare At Price": 6499,
    "SKU": "ARV-HD-BLK-S",
    "Variant Name": "Obsidian Black / S",
    "Variant Price": 4999,
    "Variant Compare Price": 6499,
    "Stock Quantity": 25,
    "Color": "Obsidian Black",
    "Color Hex": "#0D0D0D",
    "Size": "S",
    "Attributes": "Material:100% Organic Cotton;GSM:480;Fit:Oversized",
    "Barcode": "8901234567890",
    "Image URLs": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
  },
  {
    "Handle": "oversized-heavyweight-hoodie",
    "Product Name": "Oversized Heavyweight Hoodie",
    "Description": "",
    "Category": "Apparel > Hoodies",
    "Brand": "AIRAVÉ",
    "Status": "ACTIVE",
    "Visibility": "PUBLISHED",
    "Base Price": 4999,
    "Compare At Price": 6499,
    "SKU": "ARV-HD-BLK-M",
    "Variant Name": "Obsidian Black / M",
    "Variant Price": 4999,
    "Variant Compare Price": 6499,
    "Stock Quantity": 40,
    "Color": "Obsidian Black",
    "Color Hex": "#0D0D0D",
    "Size": "M",
    "Attributes": "Material:100% Organic Cotton;GSM:480;Fit:Oversized",
    "Barcode": "8901234567891",
    "Image URLs": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
  },
  {
    "Handle": "oversized-heavyweight-hoodie",
    "Product Name": "Oversized Heavyweight Hoodie",
    "Description": "",
    "Category": "Apparel > Hoodies",
    "Brand": "AIRAVÉ",
    "Status": "ACTIVE",
    "Visibility": "PUBLISHED",
    "Base Price": 4999,
    "Compare At Price": 6499,
    "SKU": "ARV-HD-WHT-L",
    "Variant Name": "Bone White / L",
    "Variant Price": 4999,
    "Variant Compare Price": 6499,
    "Stock Quantity": 30,
    "Color": "Bone White",
    "Color Hex": "#F4F4F0",
    "Size": "L",
    "Attributes": "Material:100% Organic Cotton;GSM:480;Fit:Oversized",
    "Barcode": "8901234567892",
    "Image URLs": "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80",
  },
  // Product 2: Single Product Signature Atelier Cap
  {
    "Handle": "atelier-minimal-cap",
    "Product Name": "Atelier Minimalist Cap",
    "Description": "Structured 6-panel twill cap with matte metal hardware and tonal embroidery.",
    "Category": "Accessories > Headwear",
    "Brand": "AIRAVÉ",
    "Status": "ACTIVE",
    "Visibility": "PUBLISHED",
    "Base Price": 1499,
    "Compare At Price": 1999,
    "SKU": "ARV-ACC-CAP-01",
    "Variant Name": "Default",
    "Variant Price": 1499,
    "Variant Compare Price": 1999,
    "Stock Quantity": 100,
    "Color": "Deep Charcoal",
    "Color Hex": "#1E1E1E",
    "Size": "One Size",
    "Attributes": "Material:Cotton Twill;Closure:Strapback",
    "Barcode": "8901234567893",
    "Image URLs": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80",
  },
];

/**
 * Generates an empty or sample CSV/Excel buffer for client download.
 */
export function generateImportTemplate(format: "csv" | "xlsx" = "csv"): { buffer: Buffer; mimeType: string; fileName: string } {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: TEMPLATE_HEADERS });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  if (format === "xlsx") {
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return {
      buffer,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileName: "AIRAVE_Product_Import_Template.xlsx",
    };
  }

  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const buffer = Buffer.from(csvContent, "utf-8");
  return {
    buffer,
    mimeType: "text/csv",
    fileName: "AIRAVE_Product_Import_Template.csv",
  };
}

/**
 * Generates a downloadable CSV containing only failed rows with an error reason column.
 */
export function generateErrorExportCsv(failedRows: FailedImportRow[]): Buffer {
  const exportData = failedRows.map((f) => ({
    ...f.rawData,
    _error_reason: f.reason,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  return Buffer.from(csvContent, "utf-8");
}
