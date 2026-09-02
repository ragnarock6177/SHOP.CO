# Feature Specification: Bulk Product & Variant Import

**Feature Branch**: `006-bulk-product-import`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "now we want to implemen the bulk prodcut import and it api and all should be cover like variant and eveything"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Template Download & Data Preparation (Priority: P1)

As an inventory or catalog administrator, I need to download a standardized, pre-formatted spreadsheet template (CSV / Excel) with clear header structures, sample product rows, and variant mappings (color, size, SKU, price, stock, images), so that I can prepare large catalog batches without formatting guesswork.

**Why this priority**: Without an official template with clear guidelines and sample data, catalog managers cannot structure multi-variant products accurately, leading to high failure rates during ingestion.

**Independent Test**: An admin clicks "Download Import Template" on the Products management screen, receives a downloadable file containing standard column definitions and 2 sample products (1 single product and 1 multi-variant product with multiple colors/sizes), verifies column structure, and populates data.

**Acceptance Scenarios**:

1. **Given** an admin on the Products list page, **When** they click "Download Template", **Then** the system provides a standard template containing headers for Product Name, Slug/Handle, Description, Category, Base Price, Compare At Price, Status, Visibility, SKU, Variant Name, Color, Size, Attributes (Key:Value), Stock Quantity, and Image URLs.
2. **Given** the downloaded template, **When** opened, **Then** it includes instructions, required field indicators, and valid sample rows showing how multiple variant rows associate with a single parent product handle.

---

### User Story 2 - File Upload & Pre-Import Dry-Run Validation (Priority: P1)

As a catalog administrator, I want to upload a completed CSV/Excel file and see a live dry-run validation summary (Total Rows, Valid Records, Warnings, and Actionable Errors with row numbers) before any database writes occur, so that I can catch duplicate SKUs, missing required fields, or format errors safely.

**Why this priority**: Direct raw imports without dry-run validation risk corrupting the live product catalog with invalid data, broken variant relationships, or orphan records.

**Independent Test**: Admin uploads a 50-row CSV containing 45 valid rows and 5 deliberate errors (e.g., negative price, missing name, duplicate SKU). The system validates all rows and displays an interactive summary table with exact row numbers and error descriptions without modifying live database records.

**Acceptance Scenarios**:

1. **Given** an uploaded file with valid syntax, **When** the pre-validation runs, **Then** the UI displays the total count of detected products, variants, new categories, and total stock units.
2. **Given** an uploaded file containing errors (e.g. missing required base price, duplicate SKUs within the file), **When** pre-validation completes, **Then** the UI displays an error table listing row numbers, column names, error reasons, and disables the final "Confirm Import" button until resolved or flagged to "Skip Invalid Rows".

---

### User Story 3 - Full Batch Import & Upsert Execution (Priority: P1)

As a store administrator, I want to execute the validated bulk import with the choice to either "Create New Products Only" or "Update Existing Products (Upsert by SKU/Handle)", with real-time progress feedback and automated transaction handling, so that large catalogs are ingested reliably.

**Why this priority**: Ingesting and creating parent products, variant combinations, inventory balances, attribute assignments, and image links in transactional batches is the core functional deliverable of bulk catalog management.

**Independent Test**: Uploading a 100-item dataset (containing both new products and price updates to existing products), executing the import with "Upsert" mode selected, and verifying all products and variants are accurately created/updated in the database with inventory movements logged.

**Acceptance Scenarios**:

1. **Given** a validated file, **When** the admin clicks "Execute Import", **Then** the system processes rows in managed batches, displays a live progress indicator (e.g., "Imported 75 / 100 products..."), and commits changes cleanly.
2. **Given** existing products in the catalog matching the import file's SKU or handle, **When** imported in "Upsert" mode, **Then** their prices, status, variants, and stock balances are updated without creating duplicate parent products.
3. **Given** existing products when imported in "Insert Only" mode, **When** a matching SKU or handle is found, **Then** the conflicting row is skipped and recorded in the completion report.

---

### User Story 4 - Multi-Variant & Attribute Grouping Engine (Priority: P2)

As a fashion catalog manager, I want the bulk importer to automatically detect and group multiple rows sharing the same product handle into a single product entity with distinct color, size, material, SKU, price, and stock levels, so that complex apparel items import as unified multi-variant items.

**Why this priority**: AIRAVÉ is a premium fashion platform where items exist across multiple colorways and sizes; manual single-product creation is too slow for seasonal drops.

**Independent Test**: Ingesting a CSV with 1 parent handle ("oversized-heavyweight-hoodie") across 6 rows (Black-S, Black-M, Black-L, OffWhite-S, OffWhite-M, OffWhite-L). Verifying that 1 product record is created with 6 variant records and properly mapped color/size attributes.

**Acceptance Scenarios**:

1. **Given** multiple rows with identical parent handle/slug, **When** imported, **Then** the system creates 1 parent Product with all common attributes (name, description, category, brand) and links each unique row as a Variant with its individual SKU, price, size, color, and stock.
2. **Given** image URLs provided in variant rows, **When** processed, **Then** the images are linked to the respective variant and marked with proper primary flags.

---

### User Story 5 - Import History & Failure Error Log Export (Priority: P3)

As a store manager, I want to review past import jobs with completion timestamps, success/failure counts, and be able to download an "Error Rows CSV" containing only failed records with detailed error reasons, so that I can fix errors and re-upload quickly.

**Why this priority**: When importing thousands of rows, identifying which specific 10 rows failed and why is critical for efficient data operations.

**Independent Test**: After an import with 95 successes and 5 failures, the admin clicks "Download Error Report" and receives a CSV containing only the 5 failed rows with an extra `_error_reason` column explaining what went wrong.

**Acceptance Scenarios**:

1. **Given** a completed import job with partial failures, **When** viewed in the Import History tab or completion modal, **Then** the admin can download a dedicated failure CSV formatted identically to the import template with error notes appended.

---

### Edge Cases

- **What happens when a specified category or collection does not exist in the database?**
  The importer supports an option to either auto-create missing categories on the fly with clean slugs or flag them as warnings/errors based on admin preference.
- **What happens when an external image URL in the CSV is inaccessible or returns 404/500?**
  The importer logs an image fetch warning, creates the product/variant record without crashing the entire batch, and notes the missing image in the job summary.
- **What happens if the import is interrupted halfway (network failure or server restart)?**
  Database operations are grouped into discrete per-product transactions, ensuring no half-created/orphan variant records exist.
- **What happens when duplicate SKUs exist within the uploaded file itself?**
  The pre-validation scanner flags duplicate SKUs before execution, preventing database constraint conflicts.
- **What happens when special characters, quotes, or emojis exist in descriptions or titles?**
  The parser handles standard UTF-8 encoded text and escaped CSV strings properly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a downloadable standard CSV and Excel (.xlsx) template with sample data for single and multi-variant products.
- **FR-002**: System MUST support bulk uploading of CSV and Excel spreadsheets up to 10MB (or up to 10,000 rows per job).
- **FR-003**: System MUST execute a comprehensive pre-validation dry-run before committing data, verifying required fields, numerical bounds (prices >= 0, stock >= 0), SKU uniqueness, and category existence.
- **FR-004**: System MUST display an interactive Pre-Import Summary dialog showing total products, total variants, valid records, warnings, and detailed row-by-row error diagnostics.
- **FR-005**: System MUST support grouping multi-row variant records under a shared parent product identifier (handle/slug/name).
- **FR-006**: System MUST allow administrators to choose between "Insert Only" (skip existing SKUs) and "Upsert" (update existing products/variants matching SKU or slug).
- **FR-007**: System MUST automatically create and link product attributes (e.g. Size, Color, Material, Gender) and map color hex codes where available.
- **FR-008**: System MUST support linking product and variant images via public HTTP/HTTPS URLs.
- **FR-009**: System MUST initialize inventory stock balances and record corresponding initial stock movement logs in the inventory ledger.
- **FR-010**: System MUST provide a downloadable error spreadsheet containing only rejected rows with exact column error explanations.
- **FR-011**: System MUST record all bulk import operations in the administrative Audit Log with actor ID, filename, total imported count, and timestamp.
- **FR-012**: System MUST enforce Role-Based Access Control (RBAC) ensuring only authorized staff with `products:create` / `products:manage` permissions can execute imports.

---

### Key Entities *(include if feature involves data)*

- **ImportJob**: Represents a bulk catalog upload session (ID, Admin ID, file name, total rows, successful rows, failed rows, status: `pending` | `validating` | `processing` | `completed` | `failed`, error log payload, started at, completed at).
- **Product**: Core parent item (ID, name, slug, description, category ID, brand, base price, status, visibility).
- **ProductVariant**: Specific SKU variation (ID, product ID, SKU, variant name, price, compare-at price, stock quantity, barcode).
- **ProductVariantAttribute**: Join table associating variant with specific attributes (Color, Size, Material).
- **ProductImage**: Media asset linked to product or specific variant.
- **InventoryMovement**: Stock ledger entry recording initial bulk quantity adjustments.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can upload and validate a 1,000-row catalog spreadsheet in under 5 seconds.
- **SC-002**: 100% of multi-variant groupings under the same product handle are correctly assembled into single parent products with associated variants.
- **SC-003**: In "Upsert" mode, 100% of matching SKUs update their respective prices and stock without creating duplicate records.
- **SC-004**: Zero orphaned variant records or partial database states on batch failures due to transaction isolation.
- **SC-005**: Pre-import validation catches 100% of duplicate SKUs and negative prices before database writes are initiated.
- **SC-006**: Admin users can complete the entire import journey (Select File -> Dry-Run Review -> Execute -> Completion Report) in under 4 clicks.

---

## Assumptions

- Uploaded files are encoded in standard UTF-8.
- Category names in import files match existing catalog categories or will use the auto-create flag.
- Product images referenced by URL are publicly accessible without authentication.
- Standard inventory location/warehouse will be used for initial stock assignment if multiple warehouses are configured.
- The existing RBAC permission system (`products:create` / `products:manage`) governs authorization for bulk operations.
