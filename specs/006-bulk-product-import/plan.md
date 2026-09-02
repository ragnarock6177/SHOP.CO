# Implementation Plan: Bulk Product & Variant Import

**Branch**: `006-bulk-product-import` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-bulk-product-import/spec.md`

## Summary

Build a high-performance, transactional Bulk Product & Variant Import engine for the AIRAVÉ e-commerce platform. The system enables catalog managers to download standardized multi-variant CSV/Excel templates, run pre-import dry-run validation with line-by-line error reporting, execute batch transactional imports (with Insert Only or Upsert modes), auto-create variants and attribute mappings, assign initial inventory balances, and export actionable error reports.

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+ (Backend), TypeScript 5+ / React 19 / Next.js 16 (Admin Frontend)  
**Primary Dependencies**:
- Backend: Express, Prisma ORM, `xlsx` (SheetJS) / `csv-parse`, `zod`, `multer` (for secure file upload buffer handling)
- Admin Frontend: Next.js App Router, `@tanstack/react-query`, `lucide-react`, Tailwind CSS v4, `papaparse` / `xlsx`
**Storage**: PostgreSQL (Prisma) with transactional batching  
**Testing**: Jest / Supertest (Backend API integration), React Testing / Browser verification (Admin UI)  
**Target Platform**: Node.js Linux/Windows server & modern web browsers  
**Project Type**: Full-stack web service & Admin Panel feature  
**Performance Goals**: Parse, validate, and batch-import 1,000 product rows in < 5 seconds  
**Constraints**: Zero orphaned records on partial failure, strict 2MB limit on image uploads, strictly monochrome Be Vietnam Pro styling for all admin modals and tables  
**Scale/Scope**: Support catalogs up to 10,000 rows per import job with real-time feedback  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Monochrome UI & Be Vietnam Pro**: All admin import dialogs, preview tables, status badges, and logs follow strictly monochrome styling with Be Vietnam Pro typography.
- [x] **Transactional Integrity**: Database writes are wrapped in per-batch transactions, ensuring consistent parent-variant-inventory integrity.
- [x] **RBAC Authorization**: Protected by `requireAdminAuth` and `requirePermission("products:create")`.
- [x] **Audit Logging**: All executed imports are logged in the administrative audit ledger.

## Project Structure

### Documentation (this feature)

```text
specs/006-bulk-product-import/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this document)
├── research.md          # Technical research & decisions
├── data-model.md        # Data models and row mapping schema
├── quickstart.md        # Verification and end-to-end testing scenarios
├── contracts/           # OpenAPI 3.0 specification
│   └── bulk-import-api.yaml
└── checklists/
    └── requirements.md
```

### Source Code Architecture

```text
backend/src/
├── controllers/admin/
│   └── bulkImport.controller.ts    # Template download, dry-run validation, and execution
├── services/
│   ├── bulkImport.service.ts       # Spreadsheet parsing, variant grouping, validation & DB upsert
│   └── templateGenerator.service.ts # CSV/Excel template builder with sample data
├── routes/admin/
│   └── products.routes.ts          # Mount /import/template, /import/validate, /import/execute
└── validators/admin/
    └── bulkImport.validator.ts     # Schema validation for import options

admin/src/
├── components/products/
│   ├── BulkImportDialog.tsx        # File upload, template download, dry-run preview, progress modal
│   └── ImportValidationTable.tsx   # Row-by-row diagnostics and error viewer
├── hooks/queries/
│   └── useBulkProductImport.ts     # React Query mutations for template, validate, and execute
└── app/(dashboard)/products/
    └── page.tsx                    # "Import Products" trigger button in header action bar
```

## Planned Implementation Phases

### Phase 1: Backend Parsing & Ingestion Engine
1. Add `multer` and `xlsx` / `csv-parse` dependencies to backend.
2. Implement `bulkImport.service.ts`:
   - Parse CSV / Excel buffer into standardized row objects.
   - Group rows by `Handle` to model parent products with attached child variants.
   - Pre-validation logic (check duplicate SKUs, missing names, negative prices, category existence).
   - Transactional execution logic with `INSERT_ONLY` and `UPSERT` conflict resolution.
   - Initial inventory stock balance creation and inventory movement ledger logging.
3. Implement `templateGenerator.service.ts` for instant CSV/XLSX sample template generation.
4. Implement `bulkImport.controller.ts` and mount routes in `products.routes.ts`.

### Phase 2: Admin Panel UI & Real-Time Flow
1. Create `useBulkProductImport.ts` React Query hook.
2. Build `BulkImportDialog.tsx` modal:
   - Step 1: Drag & Drop upload zone with template download button.
   - Step 2: Instant dry-run validation summary (Total Rows, Valid, Errors, Category warnings).
   - Step 3: Conflict strategy selector (Upsert vs. Insert Only) and category auto-create toggle.
   - Step 4: Live import progress bar and completion metrics.
   - Step 5: Failed rows CSV export if errors occurred.
3. Mount the "Import Products" button in `admin/src/app/(dashboard)/products/page.tsx`.

### Phase 3: Verification & Polish
1. Run automated backend integration tests covering single-product and multi-variant imports.
2. Verify Next.js frontend builds without errors (`npm run build`).
3. Validate end-to-end with the scenarios in `quickstart.md`.
