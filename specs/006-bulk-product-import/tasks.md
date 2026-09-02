---
description: "Task list for Bulk Product & Variant Import implementation"
---

# Tasks: Bulk Product & Variant Import

**Input**: Design documents from `specs/006-bulk-product-import/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/bulk-import-api.yaml](./contracts/bulk-import-api.yaml), [quickstart.md](./quickstart.md)

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- **[P]**: Parallelizable (independent files/concerns)
- **[Story]**: User Story mapping (`US1`, `US2`, `US3`, `US4`, `US5`)

---

## Phase 1: Setup & Dependencies

**Purpose**: Install required spreadsheet parsing libraries and setup shared types

- [x] T001 Install `xlsx` (SheetJS), `csv-parse`, and `multer` dependencies in `backend/package.json`
- [x] T002 [P] Create bulk import TypeScript interfaces and schemas in `backend/src/types/bulkImport.ts`
- [x] T003 [P] Create frontend bulk import TypeScript interfaces in `admin/src/types/bulkImport.ts`

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core spreadsheet parsing, validation rules, and template generator services

- [x] T004 Implement multi-format spreadsheet buffer parser (CSV, XLSX) in `backend/src/services/spreadsheetParser.service.ts`
- [x] T005 [P] Implement template generator service with sample fashion data in `backend/src/services/templateGenerator.service.ts`
- [x] T006 [P] Implement validation schema and options in `backend/src/validators/admin/bulkImport.validator.ts`
- [x] T007 Configure multer upload middleware for memory buffer handling in `backend/src/middleware/upload.ts`

---

## Phase 3: User Story 1 - Template Download & Data Preparation (Priority: P1) 🎯 MVP Part 1

**Goal**: Admins can download official CSV and Excel sample templates with clear column definitions and multi-variant examples.

**Independent Test**: Requesting `GET /api/v1/admin/products/import/template?format=csv` downloads a properly formatted CSV with all standard product & variant column headers.

- [x] T008 [US1] Implement template download endpoint in `backend/src/controllers/admin/bulkImport.controller.ts`
- [x] T009 [US1] Mount `/import/template` route in `backend/src/routes/admin/products.routes.ts`
- [x] T010 [P] [US1] Implement template download helper in `admin/src/lib/productsApi.ts`

---

## Phase 4: User Story 2 - File Upload & Pre-Import Dry-Run Validation (Priority: P1) 🎯 MVP Part 2

**Goal**: Admins can upload a spreadsheet and view a live dry-run validation summary (total products, variants, errors, warnings, duplicate SKUs) before any database write occurs.

**Independent Test**: Uploading a file with invalid rows returns row-by-row error diagnostics without altering database state.

- [x] T011 [US2] Implement dry-run validation engine (duplicate SKU check, price/stock checks, category detection) in `backend/src/services/bulkImport.service.ts`
- [x] T012 [US2] Implement `/import/validate` controller handler in `backend/src/controllers/admin/bulkImport.controller.ts`
- [x] T013 [US2] Mount `/import/validate` route in `backend/src/routes/admin/products.routes.ts`
- [x] T014 [P] [US2] Build `ImportValidationTable.tsx` component in `admin/src/components/products/ImportValidationTable.tsx`

---

## Phase 5: User Story 3 - Full Batch Import & Upsert Execution (Priority: P1) 🎯 MVP Part 3

**Goal**: Execute transactional chunked batch imports with `INSERT_ONLY` and `UPSERT` modes, initial inventory balances, and inventory movement ledger entries.

**Independent Test**: Uploading 50 products creates parent records, variants, stock balances, and ledger logs cleanly.

- [x] T015 [US3] Implement chunked transactional product/variant upsert execution logic in `backend/src/services/bulkImport.service.ts`
- [x] T016 [US3] Implement initial stock balance creation and inventory movement logging in `backend/src/services/bulkImport.service.ts`
- [x] T017 [US3] Implement `/import/execute` controller handler and audit logging in `backend/src/controllers/admin/bulkImport.controller.ts`
- [x] T018 [US3] Mount `/import/execute` route in `backend/src/routes/admin/products.routes.ts`
- [x] T019 [US3] Create `useBulkProductImport.ts` React Query mutation hook in `admin/src/hooks/queries/useBulkProductImport.ts`
- [x] T020 [US3] Build `BulkImportDialog.tsx` modal workflow in `admin/src/components/products/BulkImportDialog.tsx`
- [x] T021 [US3] Integrate "Import Products" trigger button in `admin/src/app/(dashboard)/products/page.tsx`

---

## Phase 6: User Story 4 - Multi-Variant & Attribute Grouping Engine (Priority: P2)

**Goal**: Automatically detect multi-row variant records sharing the same product handle and assemble them into parent products with linked attributes (Color, Size, Material).

**Independent Test**: A 6-row CSV with 1 handle generates 1 parent Product with 6 distinct variants and mapped attributes.

- [x] T022 [US4] Implement multi-variant handle grouping algorithm in `backend/src/services/bulkImport.service.ts`
- [x] T023 [US4] Implement dynamic attribute value creation and join table linking in `backend/src/services/bulkImport.service.ts`
- [x] T024 [P] [US4] Implement image URL fetching and registration for parent/variant images in `backend/src/services/bulkImport.service.ts`

---

## Phase 7: User Story 5 - Import History & Failure Error Log Export (Priority: P3)

**Goal**: Allow administrators to export an "Error Rows CSV" containing only failed rows with diagnostic notes appended for quick re-submission.

**Independent Test**: Clicking "Download Error Rows" exports a CSV with an added `_error_reason` column for failed rows.

- [x] T025 [US5] Implement error CSV generator for failed rows in `backend/src/services/templateGenerator.service.ts`
- [x] T026 [US5] Implement client-side error export download in `admin/src/components/products/BulkImportDialog.tsx`

---

## Phase 8: Polish, Verification & Design System Conformance

**Purpose**: Aesthetics, font conformance, and end-to-end quickstart validation

- [x] T027 [P] Enforce strict Be Vietnam Pro typography and monochrome styling (`rounded-md`, neutral palette) in `admin/src/components/products/BulkImportDialog.tsx`
- [x] T028 [P] Enforce 2MB file upload guard and image URL validation in `admin/src/components/products/BulkImportDialog.tsx`
- [x] T029 Execute full end-to-end verification following `specs/006-bulk-product-import/quickstart.md`
- [x] T030 Validate production builds with `npm run build` in both `backend` and `admin`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion.
- **Phase 3, 4, 5 (US1, US2, US3 - Core MVP)**: Depend on Phase 2 completion.
- **Phase 6 (US4 - Multi-Variant)**: Enhances Phase 5 grouping engine.
- **Phase 7 (US5 - Error Export)**: Depends on Phase 5 execution reporting.
- **Phase 8 (Polish & Verification)**: Runs after functional phases are completed.

### Parallel Opportunities
- Backend data models (`T002`) and frontend interfaces (`T003`) can run in parallel.
- Template generator (`T005`) and validation rules (`T006`) can run in parallel.
- Frontend components (`T014`, `T020`) can be styled in parallel with backend endpoints.
