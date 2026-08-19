# Implementation Tasks: Admin Panel Frontend

**Feature**: Admin Panel Frontend (`specs/004-admin-panel-frontend`)  
**Date**: 2026-08-19  
**Spec**: [spec.md](file:///d:/CS-Next/specs/004-admin-panel-frontend/spec.md) | **Plan**: [plan.md](file:///d:/CS-Next/specs/004-admin-panel-frontend/plan.md)

---

## Task Summary Overview

- **Total Tasks**: 75 Actionable Tasks
- **Phase Breakdown**: 17 Execution Phases
- **Target App**: Next.js 16 App Router application (`admin/`)
- **Backend Consumption**: 100% REST Client API calls to `/api/v1/admin/*`
- **Database Safety**: 0 direct DB queries; 0 Prisma modifications

---

## Phase 1: Admin Foundation & Routing Setup

**Purpose**: Establish Next.js App Router route structure, Axios HTTP client, and global app layout.

- [x] **T001** `[Phase 1]` Create centralized Axios API Client with authorization interceptors in `admin/src/lib/apiClient.ts`.
  - **Objective**: Configure Axios base URL (`NEXT_PUBLIC_API_URL` -> `http://localhost:5000/api/v1`), automatic `Authorization: Bearer <token>` injection, and global error response handling.
  - **Files**: `admin/src/lib/apiClient.ts`
  - **APIs**: Consumes all `/api/v1/*` endpoints.

- [x] **T002** `[P]` `[Phase 1]` Create TypeScript API response envelope definitions in `admin/src/types/api.ts`.
  - **Objective**: Define standard `ApiResponse<T>` and `ApiPaginatedResponse<T>` interfaces matching backend response formatters.
  - **Files**: `admin/src/types/api.ts`

- [x] **T003** `[Phase 1]` Create custom `useAuth` hook and authentication state provider in `admin/src/providers/AuthProvider.tsx`.
  - **Objective**: Manage session tokens, store active staff user details, and restore session on page reload via `GET /api/v1/auth/me`.
  - **Files**: `admin/src/providers/AuthProvider.tsx`, `admin/src/hooks/useAuth.ts`
  - **APIs**: `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`.

- [x] **T004** `[Phase 1]` Create Admin Authentication Route Guard in `admin/src/components/rbac/ProtectedRoute.tsx`.
  - **Objective**: Wrap protected layout routes and redirect unauthenticated users to `/login?redirect={pathname}`.
  - **Files**: `admin/src/components/rbac/ProtectedRoute.tsx`

- [x] **T005** `[Phase 1]` Create Admin Dashboard Layout shell in `admin/src/app/(dashboard)/layout.tsx`.
  - **Objective**: Combine Header, Sidebar, Breadcrumbs, and main content view container in Next.js App Router layout.
  - **Files**: `admin/src/app/(dashboard)/layout.tsx`

---

## Phase 2: Authentication & RBAC UI

**Purpose**: Implement login workflow, session expiration handling, and permission-based UI gates.

- [x] **T006** `[US1]` Implement Admin Login Page in `admin/src/app/(auth)/login/page.tsx`.
  - **Objective**: Build login form with Zod validation submitting to `POST /api/v1/auth/login`.
  - **Files**: `admin/src/app/(auth)/login/page.tsx`, `admin/src/validators/auth.validator.ts`
  - **APIs**: `POST /api/v1/auth/login`.

- [x] **T007** `[P]` `[Phase 2]` Create permission evaluation hook `usePermission` in `admin/src/hooks/usePermission.ts`.
  - **Objective**: Check staff permissions list with implicit `SUPER_ADMIN` role bypass.
  - **Files**: `admin/src/hooks/usePermission.ts`

- [x] **T008** `[P]` `[Phase 2]` Create `<PermissionGate>` UI component in `admin/src/components/rbac/PermissionGate.tsx`.
  - **Objective**: Conditionally render children or show disabled state based on active staff permissions.
  - **Files**: `admin/src/components/rbac/PermissionGate.tsx`

- [x] **T009** `[Phase 2]` Implement Header user dropdown with profile view and Logout action in `admin/src/components/layout/Header.tsx`.
  - **Objective**: Display staff avatar/initials, full name, role badge, profile link, and trigger logout.
  - **Files**: `admin/src/components/layout/Header.tsx`
  - **APIs**: `POST /api/v1/auth/logout`.

---

## Phase 3: Reusable Admin UI System

**Purpose**: Build reusable table, filter, form, modal, and feedback components.

- [x] **T010** `[P]` `[Phase 3]` Create reusable TanStack Data Table component in `admin/src/components/data-table/DataTable.tsx`.
  - **Objective**: Configurable data table supporting server-side pagination, sortable column headers, row action dropdowns, and skeleton loading states.
  - **Files**: `admin/src/components/data-table/DataTable.tsx`, `admin/src/components/data-table/Pagination.tsx`

- [x] **T011** `[P]` `[Phase 3]` Create debounced search input component in `admin/src/components/filters/SearchInput.tsx`.
  - **Objective**: Search bar with 300ms debounce handler for URL query parameter search synchronization.
  - **Files**: `admin/src/components/filters/SearchInput.tsx`, `admin/src/hooks/useDebounce.ts`

- [x] **T012** `[P]` `[Phase 3]` Create status badge component in `admin/src/components/ui/StatusBadge.tsx`.
  - **Objective**: Neutral monochrome status pills for Order, Stock, Payment, Shipment, and User statuses.
  - **Files**: `admin/src/components/ui/StatusBadge.tsx`

- [x] **T013** `[P]` `[Phase 3]` Create confirmation dialog component in `admin/src/components/feedback/ConfirmDialog.tsx`.
  - **Objective**: Accessible Radix UI modal for destructive action confirmations.
  - **Files**: `admin/src/components/feedback/ConfirmDialog.tsx`

- [x] **T014** `[P]` `[Phase 3]` Create reusable form field & inline error wrappers in `admin/src/components/forms/FormField.tsx`.
  - **Objective**: Text, Select, Checkbox, and Textarea form wrappers integrated with React Hook Form.
  - **Files**: `admin/src/components/forms/FormField.tsx`

---

## Phase 4: Executive Dashboard (User Story 1 - Priority: P1)

**Purpose**: Deliver operational dashboard with KPI cards, analytics, alerts, and date filters.

- [x] **T015** `[US1]` Create Dashboard API query hook in `admin/src/hooks/queries/useDashboard.ts`.
  - **Objective**: TanStack Query hook fetching metrics from `GET /api/v1/admin/dashboard`.
  - **Files**: `admin/src/hooks/queries/useDashboard.ts`
  - **APIs**: `GET /api/v1/admin/dashboard`.
  - **Permissions**: `dashboard:read`.

- [x] **T016** `[P]` `[US1]` Create KPI Metric Card component in `admin/src/components/dashboard/StatCard.tsx`.
  - **Objective**: Render individual KPI cards for Gross Revenue, Orders Count, Low-Stock Count, and Pending Returns.
  - **Files**: `admin/src/components/dashboard/StatCard.tsx`

- [x] **T017** `[US1]` Build Executive Dashboard Page in `admin/src/app/(dashboard)/page.tsx`.
  - **Objective**: Assemble KPI metrics grid, Low Stock Warning feed, Recent Orders widget, and Audit Trail stream.
  - **Files**: `admin/src/app/(dashboard)/page.tsx`
  - **APIs**: `GET /api/v1/admin/dashboard`.

---

## Phase 5: Catalog & Product Management (User Story 2 - Priority: P1)

**Purpose**: Build catalog management pages for Products, Categories, Collections, Attributes, and Variants.

- [x] **T018** `[US2]` Create Product API query & mutation hooks in `admin/src/hooks/queries/useProducts.ts`.
  - **Objective**: TanStack Query hooks for product list, product details, creation, update, and soft-archive.
  - **Files**: `admin/src/hooks/queries/useProducts.ts`
  - **APIs**: `GET /api/v1/admin/products`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

- [x] **T019** `[US2]` Implement Product Catalog Directory Page in `admin/src/app/(dashboard)/products/page.tsx`.
  - **Objective**: Filterable product data table with search, status/category filter dropdowns, and pagination.
  - **Files**: `admin/src/app/(dashboard)/products/page.tsx`
  - **Permissions**: `products:read`.

- [x] **T020** `[US2]` Build Product Form Component in `admin/src/components/forms/ProductForm.tsx`.
  - **Objective**: Tabbed product form for General Info, Categorization, Pricing, Status, Media Gallery, and Variants.
  - **Files**: `admin/src/components/forms/ProductForm.tsx`, `admin/src/validators/product.validator.ts`

- [x] **T021** `[US2]` Build Product Create Page in `admin/src/app/(dashboard)/products/new/page.tsx`.
  - **Objective**: Form view submitting `POST /api/v1/admin/products`.
  - **Files**: `admin/src/app/(dashboard)/products/new/page.tsx`
  - **Permissions**: `products:create`.

- [x] **T022** `[US2]` Build Product Edit Page in `admin/src/app/(dashboard)/products/[id]/page.tsx`.
  - **Objective**: Form view fetching product details and submitting `PUT /api/v1/admin/products/:id`.
  - **Files**: `admin/src/app/(dashboard)/products/[id]/page.tsx`
  - **Permissions**: `products:update`.

- [x] **T023** `[P]` `[US2]` Implement Categories Management Page in `admin/src/app/(dashboard)/categories/page.tsx`.
  - **Objective**: Hierarchical category tree table and Create/Edit category modal.
  - **Files**: `admin/src/app/(dashboard)/categories/page.tsx`
  - **APIs**: `GET`, `POST`, `PUT /api/v1/admin/categories`.
  - **Permissions**: `categories:read`, `categories:create`, `categories:update`.

- [x] **T024** `[P]` `[US2]` Implement Collections Management Page in `admin/src/app/(dashboard)/collections/page.tsx`.
  - **Objective**: Marketing collections table and Create/Edit collection modal.
  - **Files**: `admin/src/app/(dashboard)/collections/page.tsx`
  - **APIs**: `GET`, `POST`, `PUT /api/v1/admin/collections`.
  - **Permissions**: `collections:read`, `collections:create`, `collections:update`.

- [x] **T025** `[P]` `[US2]` Implement Attributes & Swatches Page in `admin/src/app/(dashboard)/attributes/page.tsx`.
  - **Objective**: Attribute directory and Value Swatch drawer.
  - **Files**: `admin/src/app/(dashboard)/attributes/page.tsx`
  - **APIs**: `GET /api/v1/admin/attributes`, `POST /:id/values`.
  - **Permissions**: `attributes:read`, `attributes:create`.

---

## Phase 6: Inventory Operations (User Story 3 - Priority: P1)

**Purpose**: Build stock balance oversight, dedicated stock adjustment modal, and movement logs.

- [x] **T026** `[US3]` Create Inventory API hooks in `admin/src/hooks/queries/useInventory.ts`.
  - **Objective**: TanStack Query hooks for inventory balances, movements, reservations, and stock adjustment mutations.
  - **Files**: `admin/src/hooks/queries/useInventory.ts`
  - **APIs**: `GET /api/v1/admin/inventory`, `POST /adjust`, `GET /movements`, `GET /reservations`.

- [x] **T027** `[US3]` Build Inventory Balances Directory Page in `admin/src/app/(dashboard)/inventory/page.tsx`.
  - **Objective**: Stock balances table showing On Hand, Reserved, Available, Stock Status badges, and Quick Adjust trigger.
  - **Files**: `admin/src/app/(dashboard)/inventory/page.tsx`
  - **Permissions**: `inventory:read`.

- [x] **T028** `[US3]` Build Dedicated Stock Adjustment Modal in `admin/src/components/forms/StockAdjustModal.tsx`.
  - **Objective**: Form modal for stock adjustments enforcing movement types (`PURCHASE`, `DAMAGE`, `LOSS`, `RETURN`) and quantity changes.
  - **Files**: `admin/src/components/forms/StockAdjustModal.tsx`
  - **APIs**: `POST /api/v1/admin/inventory/adjust`.
  - **Permissions**: `inventory:adjust`.

- [x] **T029** `[P]` `[US3]` Implement Stock Movements Log Page in `admin/src/app/(dashboard)/inventory/movements/page.tsx`.
  - **Objective**: Read-only log table for historical stock movements.
  - **Files**: `admin/src/app/(dashboard)/inventory/movements/page.tsx`
  - **Permissions**: `inventory:read`.

- [x] **T030** `[P]` `[US3]` Implement Active Inventory Reservations Page in `admin/src/app/(dashboard)/inventory/reservations/page.tsx`.
  - **Objective**: Read-only table of held stock reservations.
  - **Files**: `admin/src/app/(dashboard)/inventory/reservations/page.tsx`
  - **Permissions**: `inventory:read`.

---

## Phase 7: Customer Management

**Purpose**: Build customer directory, profile view, address book, and status management.

- [x] **T031** `[Phase 7]` Create Customer API hooks in `admin/src/hooks/queries/useCustomers.ts`.
  - **Objective**: Hooks for customer list, details, and status mutations.
  - **Files**: `admin/src/hooks/queries/useCustomers.ts`
  - **APIs**: `GET /api/v1/admin/customers`, `GET /:id`, `PATCH /:id/status`.

- [x] **T032** `[Phase 7]` Implement Customer Directory Page in `admin/src/app/(dashboard)/customers/page.tsx`.
  - **Objective**: Searchable customer data table with status pills and order count display.
  - **Files**: `admin/src/app/(dashboard)/customers/page.tsx`
  - **Permissions**: `customers:read`.

- [x] **T033** `[Phase 7]` Implement Customer Profile Details Page in `admin/src/app/(dashboard)/customers/[id]/page.tsx`.
  - **Objective**: Customer overview with saved address book grid, LTV calculation, order history stream, and Status Shift dropdown.
  - **Files**: `admin/src/app/(dashboard)/customers/[id]/page.tsx`
  - **APIs**: `GET /api/v1/admin/customers/:id`, `PATCH /:id/status`.
  - **Permissions**: `customers:read`, `customers:update`.

---

## Phase 8: Order Management & Workflow (User Story 4 - Priority: P1)

**Purpose**: Build order directory, state-machine status transition dropdown, and detail views.

- [x] **T034** `[US4]` Create Orders API hooks in `admin/src/hooks/queries/useOrders.ts`.
  - **Objective**: Hooks for order list, details, status update mutations, and status history.
  - **Files**: `admin/src/hooks/queries/useOrders.ts`
  - **APIs**: `GET /api/v1/admin/orders`, `GET /:id`, `PATCH /:id/status`.

- [x] **T035** `[US4]` Implement Orders Directory Page in `admin/src/app/(dashboard)/orders/page.tsx`.
  - **Objective**: Multi-filtered order data table with status tabs, search, and pagination.
  - **Files**: `admin/src/app/(dashboard)/orders/page.tsx`
  - **Permissions**: `orders:read`.

- [x] **T036** `[US4]` Implement Order Details Page in `admin/src/app/(dashboard)/orders/[id]/page.tsx`.
  - **Objective**: Detailed order snapshot including line items, customer card, address cards, financial breakdown, status history timeline, and Status Shift dropdown.
  - **Files**: `admin/src/app/(dashboard)/orders/[id]/page.tsx`
  - **Permissions**: `orders:read`.

- [x] **T037** `[US4]` Implement Order Cancellation Modal & Stock Release in `admin/src/components/orders/OrderCancelModal.tsx`.
  - **Objective**: Confirmation modal capturing cancellation reason and executing stock release.
  - **Files**: `admin/src/components/orders/OrderCancelModal.tsx`
  - **APIs**: `PATCH /api/v1/admin/orders/:id/status`.
  - **Permissions**: `orders:update_status`.

---

## Phase 9: Shipments & Fulfillment Dispatch

**Purpose**: Build fulfillment package creation and tracking status progression.

- [x] **T038** `[Phase 9]` Create Fulfillment API hooks in `admin/src/hooks/queries/useFulfillment.ts`.
  - **Objective**: Hooks for shipments list, shipment details, shipment creation, and tracking status updates.
  - **Files**: `admin/src/hooks/queries/useFulfillment.ts`
  - **APIs**: `GET /api/v1/admin/fulfillment`, `POST /`, `PATCH /:id/status`.

- [x] **T039** `[Phase 9]` Implement Shipments Directory Page in `admin/src/app/(dashboard)/shipments/page.tsx`.
  - **Objective**: Shipment table with carrier details, tracking URLs, and shipment status badges.
  - **Files**: `admin/src/app/(dashboard)/shipments/page.tsx`
  - **Permissions**: `fulfillment:read`.

- [x] **T040** `[Phase 9]` Build Create Shipment Modal in `admin/src/components/fulfillment/CreateShipmentModal.tsx`.
  - **Objective**: Form modal to select unfulfilled order items, carrier, and tracking number.
  - **Files**: `admin/src/components/fulfillment/CreateShipmentModal.tsx`
  - **APIs**: `POST /api/v1/admin/fulfillment`.
  - **Permissions**: `fulfillment:create`.

---

## Phase 10: Payments & Invoices Oversight

**Purpose**: Build read-only payment transaction logs and billing invoice overview.

- [x] **T041** `[P]` `[Phase 10]` Implement Payments Oversight Page in `admin/src/app/(dashboard)/payments/page.tsx`.
  - **Objective**: Read-only payment gateway transaction table with provider details and status badges.
  - **Files**: `admin/src/app/(dashboard)/payments/page.tsx`
  - **APIs**: `GET /api/v1/admin/payments`.
  - **Permissions**: `payments:read`.

- [x] **T042** `[P]` `[Phase 10]` Implement Invoices Overview Page in `admin/src/app/(dashboard)/invoices/page.tsx`.
  - **Objective**: Billing invoices directory table and printable invoice details view.
  - **Files**: `admin/src/app/(dashboard)/invoices/page.tsx`
  - **APIs**: `GET /api/v1/admin/payments/invoices`.
  - **Permissions**: `payments:read`.

---

## Phase 11: Promotional Coupons & Discounts

**Purpose**: Build coupon management directory, form editor, and category/product scope restrictions.

- [x] **T043** `[Phase 11]` Create Coupons API hooks in `admin/src/hooks/queries/useCoupons.ts`.
  - **Objective**: Hooks for coupons list, creation, update, and active status toggle.
  - **Files**: `admin/src/hooks/queries/useCoupons.ts`
  - **APIs**: `GET /api/v1/admin/coupons`, `POST /`, `PUT /:id`.

- [x] **T044** `[Phase 11]` Implement Coupons Directory Page in `admin/src/app/(dashboard)/coupons/page.tsx`.
  - **Objective**: Table listing coupon codes, discount types, validity dates, usage counters, and active switches.
  - **Files**: `admin/src/app/(dashboard)/coupons/page.tsx`
  - **Permissions**: `coupons:read`.

- [x] **T045** `[Phase 11]` Build Coupon Create & Edit Pages in `admin/src/app/(dashboard)/coupons/new/page.tsx` and `[id]/page.tsx`.
  - **Objective**: Coupon form for code, discount value, min/max bounds, usage limits, and validity period.
  - **Files**: `admin/src/app/(dashboard)/coupons/new/page.tsx`, `admin/src/app/(dashboard)/coupons/[id]/page.tsx`
  - **Permissions**: `coupons:create`, `coupons:update`.

---

## Phase 12: Content & Review Moderation

**Purpose**: Build review moderation directory, verified purchase badges, and publication toggles.

- [x] **T046** `[Phase 12]` Create Reviews API hooks in `admin/src/hooks/queries/useReviews.ts`.
  - **Objective**: Hooks for review list, publish toggle, and soft-deletion.
  - **Files**: `admin/src/hooks/queries/useReviews.ts`
  - **APIs**: `GET /api/v1/admin/reviews`, `PATCH /:id/publish`, `DELETE /:id`.

- [x] **T047** `[Phase 12]` Implement Reviews Moderation Page in `admin/src/app/(dashboard)/reviews/page.tsx`.
  - **Objective**: Moderation data table displaying product thumbnail, rating stars, review text, verified badge, publication toggle switch, and delete action.
  - **Files**: `admin/src/app/(dashboard)/reviews/page.tsx`
  - **Permissions**: `reviews:read`, `reviews:moderate`, `reviews:delete`.

---

## Phase 13: Returns & Refunds Processing

**Purpose**: Build return request inspection, return status progression, and transactional refund processor.

- [x] **T048** `[Phase 13]` Create Returns & Refunds API hooks in `admin/src/hooks/queries/useReturns.ts`.
  - **Objective**: Hooks for returns list, return status updates, refunds list, and refund processing.
  - **Files**: `admin/src/hooks/queries/useReturns.ts`
  - **APIs**: `GET /api/v1/admin/returns`, `PATCH /:id/status`, `GET /returns/refunds`, `POST /returns/refunds`.

- [x] **T049** `[Phase 13]` Implement Return Requests Directory Page in `admin/src/app/(dashboard)/returns/page.tsx`.
  - **Objective**: Return requests table filterable by status and return reason.
  - **Files**: `admin/src/app/(dashboard)/returns/page.tsx`
  - **Permissions**: `returns:read`.

- [x] **T050** `[Phase 13]` Implement Return Details Page in `admin/src/app/(dashboard)/returns/[id]/page.tsx`.
  - **Objective**: Inspection page with returned items list, customer notes, admin notes, and status transition buttons.
  - **Files**: `admin/src/app/(dashboard)/returns/[id]/page.tsx`
  - **Permissions**: `returns:read`, `returns:update`.

- [x] **T051** `[Phase 13]` Build Process Refund Modal in `admin/src/components/refunds/ProcessRefundModal.tsx`.
  - **Objective**: Form modal for refund amount and reason calling `POST /api/v1/admin/returns/refunds`.
  - **Files**: `admin/src/components/refunds/ProcessRefundModal.tsx`
  - **APIs**: `POST /api/v1/admin/returns/refunds`.
  - **Permissions**: `refunds:create`.

- [x] **T052** `[P]` `[Phase 13]` Implement Refund Ledger Page in `admin/src/app/(dashboard)/refunds/page.tsx`.
  - **Objective**: Read-only refund transactions table with provider references.
  - **Files**: `admin/src/app/(dashboard)/refunds/page.tsx`
  - **Permissions**: `refunds:read`.

---

## Phase 14: Platform Administration (Staff & Roles) (User Story 5 - Priority: P2)

**Purpose**: Build staff user management and interactive role permission matrix UI.

- [x] **T053** `[US5]` Create Admin Users & Roles API hooks in `admin/src/hooks/queries/useAdminUsers.ts`.
  - **Objective**: Hooks for staff accounts, status updates, roles directory, and role permission mutations.
  - **Files**: `admin/src/hooks/queries/useAdminUsers.ts`
  - **APIs**: `GET /api/v1/admin/admin-users`, `POST /`, `PATCH /:id/status`, `GET /roles`, `POST /roles`, `PUT /roles/:id`.

- [x] **T054** `[US5]` Implement Admin Staff Users Page in `admin/src/app/(dashboard)/admin-users/page.tsx`.
  - **Objective**: Staff directory table, Create/Edit staff user modal, and privilege escalation guards.
  - **Files**: `admin/src/app/(dashboard)/admin-users/page.tsx`
  - **Permissions**: `admin_users:read`, `admin_users:create`, `admin_users:update`.

- [x] **T055** `[US5]` Implement Roles List Page in `admin/src/app/(dashboard)/roles/page.tsx`.
  - **Objective**: Roles directory table showing assigned user count and system role badges.
  - **Files**: `admin/src/app/(dashboard)/roles/page.tsx`
  - **Permissions**: `roles:read`.

- [x] **T056** `[US5]` Build Interactive Permission Matrix Grid Component in `admin/src/components/roles/RoleMatrixGrid.tsx`.
  - **Objective**: Grid table displaying permissions grouped by domain with domain-level select all toggles.
  - **Files**: `admin/src/components/roles/RoleMatrixGrid.tsx`

- [x] **T057** `[US5]` Implement Role Create & Edit Pages in `admin/src/app/(dashboard)/roles/new/page.tsx` and `[id]/page.tsx`.
  - **Objective**: Role form with embedded permission matrix submitting `POST` / `PUT /api/v1/admin/roles/:id`.
  - **Files**: `admin/src/app/(dashboard)/roles/new/page.tsx`, `admin/src/app/(dashboard)/roles/[id]/page.tsx`
  - **Permissions**: `roles:create`, `roles:update`.

---

## Phase 15: System Audit Logs

**Purpose**: Build read-only system activity trail and payload diff viewer.

- [x] **T058** `[Phase 15]` Create Audit Logs API hooks in `admin/src/hooks/queries/useAuditLogs.ts`.
  - **Objective**: Hooks for audit log search, entity filtering, and record details.
  - **Files**: `admin/src/hooks/queries/useAuditLogs.ts`
  - **APIs**: `GET /api/v1/admin/audit-logs`, `GET /:id`.

- [x] **T059** `[Phase 15]` Implement Audit Logs Directory Page in `admin/src/app/(dashboard)/audit-logs/page.tsx`.
  - **Objective**: Read-only activity log table with entity type and actor user filters.
  - **Files**: `admin/src/app/(dashboard)/audit-logs/page.tsx`
  - **Permissions**: `audit_logs:read`.

- [x] **T060** `[Phase 15]` Build Audit Payload Diff Drawer in `admin/src/components/audit/AuditPayloadDrawer.tsx`.
  - **Objective**: Drawer displaying formatted JSON diff of `oldValues` vs `newValues` with sensitive payload redactions (`[REDACTED]`).
  - **Files**: `admin/src/components/audit/AuditPayloadDrawer.tsx`

---

## Phase 16: UX Polish, Responsiveness & Accessibility

**Purpose**: Ensure responsive breakpoints, mobile drawers, keyboard focus traps, and theme consistency.

- [x] **T061** `[P]` `[Phase 16]` Implement Mobile Navigation Drawer in `admin/src/components/layout/MobileSidebar.tsx`.
  - **Objective**: Slide-over navigation drawer for viewports `< 1024px` triggered by header hamburger button.
  - **Files**: `admin/src/components/layout/MobileSidebar.tsx`

- [x] **T062** `[P]` `[Phase 16]` Implement Keyboard Focus Management & Accessibility in `admin/src/components/feedback/ModalWrapper.tsx`.
  - **Objective**: Modal overlay focus trap and keyboard `Escape` key close handler.
  - **Files**: `admin/src/components/feedback/ModalWrapper.tsx`

- [x] **T063** `[P]` `[Phase 16]` Implement Toast Notification Manager with Sonner in `admin/src/lib/toast.ts`.
  - **Objective**: Standardized toast helpers for API success, validation errors, and network failures.
  - **Files**: `admin/src/lib/toast.ts`

---


---

## Dependencies & Execution Order

```
Phase 1: Foundation & Setup (T001 - T005)
   │
   ▼
Phase 2: Auth & RBAC UI (T006 - T009)
   │
   ▼
Phase 3: Reusable UI System (T010 - T014)
   │
   ├───────────────────────┬───────────────────────┐
   ▼                       ▼                       ▼
Phase 4: Dashboard     Phase 5: Catalog        Phase 6: Inventory
(T015 - T017)          (T018 - T025)           (T026 - T030)
   │                       │                       │
   └───────────────────────┼───────────────────────┘
                           ▼
                 Phase 7: Customers (T031 - T033)
                           │
                           ▼
                 Phase 8: Orders (T034 - T037)
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
         Phase 9: Shipments   Phase 10: Payments/Invoices
         (T038 - T040)        (T041 - T042)
                 │                   │
                 └─────────┬─────────┘
                           ▼
                 Phase 11: Coupons (T043 - T045)
                           │
                           ▼
                 Phase 12: Reviews (T046 - T047)
                           │
                           ▼
                 Phase 13: Returns & Refunds (T048 - T052)
                           │
                           ▼
                 Phase 14: Platform Administration (T053 - T057)
                           │
                           ▼
                 Phase 15: System Audit Logs (T058 - T060)
                           │
                           ▼
                 Phase 16: UX Polish & Accessibility (T061 - T063)
                           │
                           ▼
                 Phase 17: Testing & Verification (T064 - T075)
```

---

## 🛑 Checkpoint & Safety Rules

- **Database Safety**: Frontend tasks communicate exclusively via HTTP REST APIs (`/api/v1/admin/*`).
- **No In-Memory Editing of Balances**: Inventory balance adjustments are conducted strictly through `<StockAdjustModal>` calling `POST /api/v1/admin/inventory/adjust`.
- **Authoritative Security**: Client-side permission gates treat client state as untrusted; all security enforcement resides in backend middleware.
