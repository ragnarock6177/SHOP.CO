# Research & Technical Decisions: Bulk Product & Variant Import

**Feature**: `006-bulk-product-import`  
**Date**: 2026-09-02  
**Status**: Completed

## 1. File Parsing & Multi-Format Ingestion

### Decision
Use `xlsx` (SheetJS) or `csv-parse` on the server and client-side streaming parser (`papaparse` for CSV, `xlsx` for Excel) with standardized row transformation.

### Rationale
- `xlsx` provides native parsing for `.xlsx`, `.xls`, and `.csv` formats in both Node.js backend and browser environments.
- Normalizes diverse spreadsheet outputs (different column capitalization, extra whitespace, formatted numbers/currency symbols) into a strongly-typed schema.

### Alternatives Considered
- **Raw CSV regex/split**: Rejected due to inability to handle escaped commas, quotes, linebreaks in descriptions, and Excel binary formats.
- **Excel-only (`exceljs`)**: Heavier package and slower for simple streaming CSV processing.

---

## 2. Multi-Variant Grouping Strategy

### Decision
Group CSV/Excel rows by `Handle` (or `Slug` / `Product Name`). 
- The first row for a handle establishes the parent Product attributes (Name, Slug, Description, Category, Brand, Base Price, Status, Visibility).
- Subsequent rows with the same handle (or all rows for that handle) declare individual Variants (SKU, Color, Size, Variant Price, Compare At Price, Stock Quantity, Barcode, Images).
- In flat single-product mode (no explicit variant columns or single row without handle repeats), automatically generate a Default Variant for SKU and inventory tracking.

### Rationale
- Industry standard used by Shopify, WooCommerce, and Magento, making vendor migration friction-free.
- Allows apparel products to define 10+ color/size variations seamlessly in a spreadsheet.

---

## 3. Pre-Import Dry-Run Validation

### Decision
Implement a 2-stage validation pipeline:
1. **Client-side instant format check**: Parses file headers, required fields, basic numeric checks (<100ms feedback).
2. **Backend Dry-Run API (`POST /api/v1/admin/products/import/validate`)**: Performs database-aware validation:
   - Checks existing SKUs and slugs.
   - Verifies referenced Categories and Collections exist (identifies which categories will be created if auto-create is enabled).
   - Validates attribute keys (Size, Color, Material).
   - Returns a structured diagnostic report: `{ totalRows, validProducts, validVariants, newCategories, warnings: [], errors: [] }`.

### Rationale
- Prevents database deadlocks, partial writes, or corrupted catalog hierarchies.
- Gives the administrator 100% confidence before committing changes.

---

## 4. Upsert vs Insert Transaction Architecture

### Decision
Execute imports in transactional chunks (e.g. 50 parent products per Prisma/PostgreSQL transaction) with configurable conflict strategy:
- `INSERT_ONLY`: Skip existing SKUs and report them as skipped.
- `UPSERT`: Update existing parent products and variants by SKU or slug, update stock movements, and insert new variants/attributes.

### Rationale
- Isolates failures so one bad row in a 5,000-row catalog doesn't abort the entire job if "skip invalid" is selected, or rolls back cleanly if strict mode is active.
- Chunks prevent PostgreSQL transaction timeout and memory ballooning.

---

## 5. Audit Logging & Error Export

### Decision
- Store import job history in an `ImportJob` record (or structured audit log) recording admin ID, filename, total records, success count, failure count, and JSON error details.
- Provide a `GET /api/v1/admin/products/import/template` endpoint generating sample files with comments.
- Provide a dynamic `POST /api/v1/admin/products/import/errors/export` returning an annotated CSV containing only failed rows with `_error_reason` column.
