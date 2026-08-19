# Implementation Tasks: AIRAVÉ Admin Panel

**Feature**: Admin Panel Specification & Plan  
**Branch**: `003-admin-panel`  
**Date**: 2026-08-19  
**Plan**: [plan.md](file:///d:/CS-Next/specs/003-admin-panel/plan.md) | **Spec**: [spec.md](file:///d:/CS-Next/specs/003-admin-panel/spec.md)

---

## Task Overview & Dependencies

```text
Phase 1: Admin API Foundation (T001 - T005)
  ↓
Phase 2: RBAC & User Administration (T006 - T011)
  ↓
Phase 3: Dashboard & Analytics (T012 - T014)
  ↓
Phase 4: Catalog & Products (T015 - T024)
  ↓
Phase 5: Inventory Operations (T025 - T029)
  ↓
Phase 6: Customers & Address Book (T030 - T033)
  ↓
Phase 7: Order Management & Workflow (T034 - T039)
  ↓
Phase 8: Shipments & Fulfillment (T040 - T043)
  ↓
Phase 9: Payments & Invoices (T044 - T047)
  ↓
Phase 10: Marketing & Coupons (T048 - T052)
  ↓
Phase 11: Reviews & Moderation (T053 - T056)
  ↓
Phase 12: After Sales - Returns & Refunds (T057 - T062)
  ↓
Phase 13: Audit Logging & Inspection (T063 - T065)
  ↓
Phase 14: Testing & Security Hardening (T066 - T072)
```

---

## Phase 1: Admin API Foundation

- [x] **T001** `[Phase 1]` Create Admin base router structure in `backend/src/routes/admin/index.ts` mounting under `/api/v1/admin`.
  - **Objective**: Establish unified administrative route entry point.
  - **Files**: `backend/src/routes/admin/index.ts`, `backend/src/routes/index.ts`
  - **Reused Code**: Existing Express router in `backend/src/routes/index.ts`.
  - **Acceptance Criteria**: `/api/v1/admin` returns 404 or routes cleanly to sub-routers.

- [x] **T002** `[P]` `[Phase 1]` Implement Admin status authentication middleware in `backend/src/middleware/adminAuth.ts`.
  - **Objective**: Verify active JWT session and ensure `req.user.status === 'ACTIVE'`.
  - **Files**: `backend/src/middleware/adminAuth.ts`
  - **Reused Code**: `backend/src/middleware/auth.ts`, `backend/src/utils/errors.ts`.
  - **Acceptance Criteria**: Blocks unauthenticated or suspended/blocked accounts with HTTP `401`/`403`.

- [x] **T003** `[P]` `[Phase 1]` Implement Granular RBAC Permission Middleware `requirePermission` in `backend/src/middleware/rbac.ts`.
  - **Objective**: Query `users` → `user_roles` → `roles` → `role_permissions` → `permissions` to verify explicit capability string (e.g. `products:read`).
  - **Files**: `backend/src/middleware/rbac.ts`
  - **Database Models**: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`.
  - **Acceptance Criteria**: Denies access with HTTP `403 Forbidden` if user lacks required permission string.

- [x] **T004** `[P]` `[Phase 1]` Implement Admin Query Parameter Sanitizer in `backend/src/utils/adminQueryParams.ts`.
  - **Objective**: Parse, sanitize, and validate list parameters (`page`, `limit`, `sort_by`, `sort_order`, `search`, filters) using Zod.
  - **Files**: `backend/src/utils/adminQueryParams.ts`
  - **Reused Code**: `backend/src/middleware/validate.ts`.
  - **Acceptance Criteria**: Rejects raw JSON query objects; enforces max limit 100 and column whitelist.

- [x] **T005** `[P]` `[Phase 1]` Standardize Admin Response Helper formatting in `backend/src/utils/adminResponse.ts`.
  - **Objective**: Ensure uniform `{ success: true, data: ..., pagination: { page, limit, total, totalPages } }` responses.
  - **Files**: `backend/src/utils/adminResponse.ts`
  - **Reused Code**: `backend/src/utils/response.ts`.
  - **Acceptance Criteria**: All admin APIs format array listings with exact pagination envelope.

---

## Phase 2: RBAC & User Administration

- [x] **T006** `[Phase 2]` `[US1]` Implement Admin User List API `GET /api/v1/admin/admin-users`.
  - **Objective**: List administrative staff accounts with status and role filters.
  - **Files**: `backend/src/routes/admin/adminUsers.routes.ts`, `backend/src/controllers/admin/adminUsers.controller.ts`, `backend/src/services/admin/adminUsers.service.ts`
  - **Database Models**: `users`, `user_roles`, `roles`.
  - **Authorization**: Requires permission `admin_users:read`.
  - **Acceptance Criteria**: Excludes `password_hash`; returns users with assigned role names.

- [x] **T007** `[Phase 2]` `[US1]` Implement Admin User Create & Update APIs `POST` & `PUT /api/v1/admin/admin-users`.
  - **Objective**: Create new admin staff or update email, name, status, and assigned roles.
  - **Files**: `backend/src/routes/admin/adminUsers.routes.ts`, `backend/src/controllers/admin/adminUsers.controller.ts`, `backend/src/validators/admin/adminUsers.validator.ts`
  - **Privilege Escalation Protection**: Prevents non-`SUPER_ADMIN` users from granting `SUPER_ADMIN` role.
  - **Acceptance Criteria**: Rejects escalation attempts with `403 Forbidden`; hashes password on create.

- [x] **T008** `[Phase 2]` `[US1]` Implement Roles List & Detail API `GET /api/v1/admin/roles`.
  - **Objective**: Retrieve system roles and associated permission string lists.
  - **Files**: `backend/src/routes/admin/roles.routes.ts`, `backend/src/controllers/admin/roles.controller.ts`
  - **Database Models**: `roles`, `permissions`, `role_permissions`.
  - **Acceptance Criteria**: Returns roles with permission IDs and capability names.

- [x] **T009** `[Phase 2]` `[US1]` Implement Role Create & Permission Mutation API `POST` & `PUT /api/v1/admin/roles/:id`.
  - **Objective**: Create custom role or update assigned permissions (`role_permissions`).
  - **Files**: `backend/src/routes/admin/roles.routes.ts`, `backend/src/controllers/admin/roles.controller.ts`, `backend/src/services/admin/roles.service.ts`
  - **Transaction**: Uses `prisma.$transaction` to replace `role_permissions` join entries.
  - **Acceptance Criteria**: Atomically updates role permissions and logs audit entry.

- [x] **T010** `[P]` `[Phase 2]` `[US1]` Implement Permissions Directory API `GET /api/v1/admin/permissions`.
  - **Objective**: Return list of available system permission keys grouped by domain.
  - **Files**: `backend/src/routes/admin/roles.routes.ts`, `backend/src/controllers/admin/roles.controller.ts`
  - **Database Models**: `permissions`.
  - **Acceptance Criteria**: Returns all permission rows for role setup selection.

- [x] **T011** `[Phase 2]` `[US1]` Implement User Status Toggle API `PATCH /api/v1/admin/admin-users/:id/status`.
  - **Objective**: Transition user account status (`ACTIVE`, `SUSPENDED`, `BLOCKED`).
  - **Files**: `backend/src/routes/admin/adminUsers.routes.ts`, `backend/src/controllers/admin/adminUsers.controller.ts`
  - **Database Models**: `users` (`user_status` enum).
  - **Acceptance Criteria**: Updates status, invalidates session token, records audit entry.

---

## Phase 3: Dashboard & Analytics

- [x] **T012** `[Phase 3]` `[US2]` Implement Dashboard Metrics Aggregation Service in `backend/src/services/admin/dashboard.service.ts`.
  - **Objective**: Aggregate order counts, gross/net sales, low-stock count, and pending returns/refunds.
  - **Files**: `backend/src/services/admin/dashboard.service.ts`
  - **Database Models**: `orders`, `inventories`, `users`, `returns`, `refunds`.
  - **Acceptance Criteria**: Calculates accurate revenue excluding `CANCELLED` and `REFUNDED` orders.

- [x] **T013** `[Phase 3]` `[US2]` Implement Dashboard Summary Endpoint `GET /api/v1/admin/dashboard`.
  - **Objective**: Expose metrics, inventory alert threshold feed, and recent orders widget data.
  - **Files**: `backend/src/routes/admin/dashboard.routes.ts`, `backend/src/controllers/admin/dashboard.controller.ts`
  - **Authorization**: Requires permission `dashboard:read`.
  - **Acceptance Criteria**: Returns JSON metric payload filtered by optional date range.

- [x] **T014** `[P]` `[Phase 3]` `[US2]` Add Recent Audit Trail Widget to Dashboard API payload.
  - **Objective**: Include latest 10 system audit log events in dashboard summary.
  - **Files**: `backend/src/services/admin/dashboard.service.ts`
  - **Database Models**: `audit_logs`, `users`.
  - **Acceptance Criteria**: Includes timestamp, admin user name, entity type, and action string.

---

## Phase 4: Catalog & Product Management

- [x] **T015** `[Phase 4]` `[US1]` Implement Admin Product List API `GET /api/v1/admin/products`.
  - **Objective**: Server-side filterable catalog list (search, status, visibility, category, collection, price range, page, limit).
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`, `backend/src/services/admin/products.service.ts`
  - **Database Models**: `products`, `product_categories`, `categories`.
  - **Authorization**: Requires permission `products:read`.
  - **Acceptance Criteria**: Returns paginated products with primary category and variant counts.

- [x] **T016** `[Phase 4]` `[US1]` Implement Admin Product Details API `GET /api/v1/admin/products/:id`.
  - **Objective**: Fetch complete product details with categories, collections, images, attributes, and variants.
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`
  - **Database Models**: `products`, `product_variants`, `product_images`, `product_categories`, `product_collections`.
  - **Acceptance Criteria**: Returns populated entity graph with default variant and gallery images.

- [x] **T017** `[Phase 4]` `[US1]` Implement Product Creation API `POST /api/v1/admin/products`.
  - **Objective**: Create product shell, primary category association, and initial inventory rows.
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`, `backend/src/validators/admin/products.validator.ts`
  - **Transaction**: `prisma.$transaction` creating `products`, `product_categories`, and default `product_variants` & `inventories`.
  - **Acceptance Criteria**: Enforces unique slug & SKU constraint; logs creation in `audit_logs`.

- [x] **T018** `[Phase 4]` `[US1]` Implement Product Mutation API `PUT /api/v1/admin/products/:id`.
  - **Objective**: Update product fields, prices, categories, and collections.
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`
  - **Authorization**: Requires permission `products:update`.
  - **Acceptance Criteria**: Updates product fields and records previous/new price values in audit log if changed.

- [x] **T019** `[P]` `[Phase 4]` `[US1]` Implement Categories Management APIs `GET`, `POST`, `PUT /api/v1/admin/categories`.
  - **Objective**: Manage category hierarchy tree (`parent_id`), display order, and status (`category_status`).
  - **Files**: `backend/src/routes/admin/categories.routes.ts`, `backend/src/controllers/admin/categories.controller.ts`, `backend/src/services/admin/categories.service.ts`
  - **Database Models**: `categories` (`category_status` enum).
  - **Acceptance Criteria**: Prevents circular `parent_id` assignment (`parent_id != id`).

- [x] **T020** `[P]` `[Phase 4]` `[US1]` Implement Collections Management APIs `GET`, `POST`, `PUT /api/v1/admin/collections`.
  - **Objective**: Manage marketing collections, featured flags, publishing schedules, and product order (`sort_order`).
  - **Files**: `backend/src/routes/admin/collections.routes.ts`, `backend/src/controllers/admin/collections.controller.ts`, `backend/src/services/admin/collections.service.ts`
  - **Database Models**: `collections`, `product_collections`.
  - **Acceptance Criteria**: Supports bulk product re-ordering within collection.

- [x] **T021** `[P]` `[Phase 4]` `[US1]` Implement Attributes & Values APIs `GET`, `POST`, `PUT /api/v1/admin/attributes`.
  - **Objective**: Define variant attributes (Size, Color) and attribute values (Hex code, sort order).
  - **Files**: `backend/src/routes/admin/attributes.routes.ts`, `backend/src/controllers/admin/attributes.controller.ts`
  - **Database Models**: `attributes`, `attribute_values`.
  - **Acceptance Criteria**: Validates unique attribute names and hex color codes.

- [x] **T022** `[Phase 4]` `[US1]` Implement Product Variant Management APIs `POST`, `PUT /api/v1/admin/products/:id/variants`.
  - **Objective**: Add or update product variants, SKU, price, weight, and `product_variant_attribute_values`.
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`, `backend/src/services/admin/variants.service.ts`
  - **Database Models**: `product_variants`, `product_variant_attribute_values`, `inventories`.
  - **Acceptance Criteria**: Automatically creates `inventories` row with initial 0 balance if new variant created.

- [x] **T023** `[P]` `[Phase 4]` `[US1]` Implement Product Media Gallery APIs `POST`, `PUT`, `DELETE /api/v1/admin/products/:id/images`.
  - **Objective**: Manage product gallery image URLs, alt text, and display ordering (`display_order`).
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`
  - **Database Models**: `product_images`.
  - **Acceptance Criteria**: Updates image sort orders and deletes image records safely.

- [x] **T024** `[Phase 4]` `[US1]` Implement Product Status Archive API `DELETE /api/v1/admin/products/:id`.
  - **Objective**: Transition product status to `ARCHIVED` (soft archive).
  - **Files**: `backend/src/routes/admin/products.routes.ts`, `backend/src/controllers/admin/products.controller.ts`
  - **Database Models**: `products` (`product_status` enum).
  - **Acceptance Criteria**: Updates `status = 'ARCHIVED'` without hard-deleting database row.

---

## Phase 5: Inventory Operations

- [x] **T025** `[Phase 5]` `[US3]` Implement Inventory List API `GET /api/v1/admin/inventory`.
  - **Objective**: Filterable stock view showing `quantity_on_hand`, `quantity_reserved`, `available_quantity`, and low-stock alerts.
  - **Files**: `backend/src/routes/admin/inventory.routes.ts`, `backend/src/controllers/admin/inventory.controller.ts`, `backend/src/services/admin/inventory.service.ts`
  - **Database Models**: `inventories`, `product_variants`, `products`.
  - **Acceptance Criteria**: Computes `available_quantity = quantity_on_hand - quantity_reserved`; filters by stock alert states.

- [x] **T026** `[Phase 5]` `[US3]` Implement Transaction-Safe Stock Adjustment API `POST /api/v1/admin/inventory/adjust`.
  - **Objective**: Execute business stock adjustment, updating `quantity_on_hand` and logging `inventory_movements`.
  - **Files**: `backend/src/routes/admin/inventory.routes.ts`, `backend/src/controllers/admin/inventory.controller.ts`, `backend/src/validators/admin/inventory.validator.ts`
  - **Transaction**: `prisma.$transaction` locking inventory row, updating balance, inserting `inventory_movements` with `movement_type` (`PURCHASE`, `ADJUSTMENT`, `DAMAGE`, `LOSS`, `RETURN`).
  - **Acceptance Criteria**: Fails with `ValidationError` if adjustment results in negative `quantity_on_hand`.

- [x] **T027** `[P]` `[Phase 5]` `[US3]` Implement Inventory Movements History API `GET /api/v1/admin/inventory/movements`.
  - **Objective**: Read-only log view of all stock movement records filterable by SKU, movement type, and date range.
  - **Files**: `backend/src/routes/admin/inventory.routes.ts`, `backend/src/controllers/admin/inventory.controller.ts`
  - **Database Models**: `inventory_movements`, `inventories`, `users`.
  - **Acceptance Criteria**: Returns immutable movement logs with actor admin user details.

- [x] **T028** `[P]` `[Phase 5]` `[US3]` Implement Active Inventory Reservations View API `GET /api/v1/admin/inventory/reservations`.
  - **Objective**: View active cart and order stock reservations (`inventory_reservations`).
  - **Files**: `backend/src/routes/admin/inventory.routes.ts`, `backend/src/controllers/admin/inventory.controller.ts`
  - **Database Models**: `inventory_reservations`, `orders`.
  - **Acceptance Criteria**: Displays reserved quantities, order links, and expiration timestamps.

- [x] **T029** `[Phase 5]` `[US3]` Implement Inventory Threshold Settings API `PUT /api/v1/admin/inventory/:id/threshold`.
  - **Objective**: Update reorder level (`reorder_level`) threshold for a variant's inventory row.
  - **Files**: `backend/src/routes/admin/inventory.routes.ts`, `backend/src/controllers/admin/inventory.controller.ts`
  - **Database Models**: `inventories`.
  - **Acceptance Criteria**: Updates threshold and triggers dashboard alert when available stock drops below.

---

## Phase 6: Customers & Address Book

- [x] **T030** `[Phase 6]` `[US1]` Implement Customer Directory API `GET /api/v1/admin/customers`.
  - **Objective**: Search customer accounts by name, email, or phone; filter by `user_status` and verification states.
  - **Files**: `backend/src/routes/admin/customers.routes.ts`, `backend/src/controllers/admin/customers.controller.ts`, `backend/src/services/admin/customers.service.ts`
  - **Database Models**: `users` (`user_status` enum).
  - **Acceptance Criteria**: Always excludes `password_hash` from payload response.

- [x] **T031** `[Phase 6]` `[US1]` Implement Customer Profile Details API `GET /api/v1/admin/customers/:id`.
  - **Objective**: Detailed customer profile, saved addresses (`addresses`), lifetime order count, and total spend.
  - **Files**: `backend/src/routes/admin/customers.routes.ts`, `backend/src/controllers/admin/customers.controller.ts`
  - **Database Models**: `users`, `addresses`, `orders`.
  - **Acceptance Criteria**: Aggregates LTV and order count accurately.

- [x] **T032** `[Phase 6]` `[US1]` Implement Customer Account Status Operation API `PATCH /api/v1/admin/customers/:id/status`.
  - **Objective**: Suspend, block, or reactivate customer account (`ACTIVE`, `SUSPENDED`, `BLOCKED`).
  - **Files**: `backend/src/routes/admin/customers.routes.ts`, `backend/src/controllers/admin/customers.controller.ts`, `backend/src/validators/admin/customers.validator.ts`
  - **Database Models**: `users` (`user_status` enum).
  - **Acceptance Criteria**: Updates user status and logs audit entry.

- [x] **T033** `[P]` `[Phase 6]` `[US1]` Implement Customer Order History API `GET /api/v1/admin/customers/:id/orders`.
  - **Objective**: List all historical orders placed by a specific customer.
  - **Files**: `backend/src/routes/admin/customers.routes.ts`, `backend/src/controllers/admin/customers.controller.ts`
  - **Database Models**: `orders`.
  - **Acceptance Criteria**: Returns paginated order list filtered by customer ID.

---

## Phase 7: Order Management & State Machine Workflow

- [x] **T034** `[Phase 7]` `[US2]` Implement Admin Order List API `GET /api/v1/admin/orders`.
  - **Objective**: Multi-filter order list (`order_status`, `payment_status`, `shipment_status`, customer name/email, order number, price range, date range).
  - **Files**: `backend/src/routes/admin/orders.routes.ts`, `backend/src/controllers/admin/orders.controller.ts`, `backend/src/services/admin/orders.service.ts`
  - **Database Models**: `orders`, `users`, `payments`, `shipments`.
  - **Acceptance Criteria**: Supports instant search and status filter tabs.

- [x] **T035** `[Phase 7]` `[US2]` Implement Admin Order Details API `GET /api/v1/admin/orders/:id`.
  - **Objective**: Complete order snapshot: items (`order_items`), shipping/billing address, payment info, shipment details, and status history timeline.
  - **Files**: `backend/src/routes/admin/orders.routes.ts`, `backend/src/controllers/admin/orders.controller.ts`
  - **Database Models**: `orders`, `order_items`, `order_status_history`, `addresses`, `payments`, `shipments`.
  - **Acceptance Criteria**: Returns immutable line item prices and full timeline history.

- [x] **T036** `[Phase 7]` `[US2]` Implement State Machine Transition Validator `validateOrderTransition` in `backend/src/services/admin/orders.service.ts`.
  - **Objective**: Validate state transitions (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`; `CANCELLED`, `REFUNDED`).
  - **Files**: `backend/src/services/admin/orders.service.ts`
  - **Acceptance Criteria**: Rejects invalid transitions (e.g. `SHIPPED` → `PENDING`) with `ValidationError`.

- [x] **T037** `[Phase 7]` `[US2]` Implement Order Status Shift API `PATCH /api/v1/admin/orders/:id/status`.
  - **Objective**: Mutate order status, append `order_status_history` record with admin notes, and release stock if transitioning to `CANCELLED`.
  - **Files**: `backend/src/routes/admin/orders.routes.ts`, `backend/src/controllers/admin/orders.controller.ts`, `backend/src/validators/admin/orders.validator.ts`
  - **Transaction**: `prisma.$transaction` updating `orders.order_status`, inserting `order_status_history`, and logging audit entry.
  - **Acceptance Criteria**: Successfully updates status and records transition history with actor user ID.

- [x] **T038** `[P]` `[Phase 7]` `[US2]` Implement Order Status History Stream API `GET /api/v1/admin/orders/:id/history`.
  - **Objective**: Retrieve chronologically ordered status transition logs for an order.
  - **Files**: `backend/src/routes/admin/orders.routes.ts`, `backend/src/controllers/admin/orders.controller.ts`
  - **Database Models**: `order_status_history`, `users`.
  - **Acceptance Criteria**: Returns timeline showing previous status, new status, timestamp, and notes.

- [x] **T039** `[Phase 7]` `[US2]` Implement Order Cancellation & Stock Release Action in `backend/src/services/admin/orders.service.ts`.
  - **Objective**: Handle manual order cancellation, releasing reserved/held inventory items back to `quantity_on_hand`.
  - **Files**: `backend/src/services/admin/orders.service.ts`
  - **Transaction**: `prisma.$transaction` updating order status to `CANCELLED` and restoring stock balances.
  - **Acceptance Criteria**: Restores inventory balances accurately and logs `RELEASE` movement.

---

## Phase 8: Shipments & Fulfillment

- [x] **T040** `[Phase 8]` `[US2]` Implement Shipment Generation API `POST /api/v1/admin/shipments`.
  - **Objective**: Create package shipment for unfulfilled order items, assigning carrier, tracking number, and tracking URL.
  - **Files**: `backend/src/routes/admin/shipments.routes.ts`, `backend/src/controllers/admin/shipments.controller.ts`, `backend/src/validators/admin/shipments.validator.ts`
  - **Transaction**: `prisma.$transaction` creating `shipments`, `shipment_items`, and updating order `shipment_status`.
  - **Acceptance Criteria**: Generates unique shipment number and links selected `order_items`.

- [x] **T041** `[P]` `[Phase 8]` `[US2]` Implement Admin Shipment List API `GET /api/v1/admin/shipments`.
  - **Objective**: Filterable shipment list by carrier, shipment status, tracking number, and date range.
  - **Files**: `backend/src/routes/admin/shipments.routes.ts`, `backend/src/controllers/admin/shipments.controller.ts`
  - **Database Models**: `shipments`, `shipment_items`, `orders`.
  - **Acceptance Criteria**: Returns package details and linked order reference.

- [x] **T042** `[Phase 8]` `[US2]` Implement Shipment Status Shift API `PATCH /api/v1/admin/shipments/:id/status`.
  - **Objective**: Update shipment status (`PACKED` → `SHIPPED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED`).
  - **Files**: `backend/src/routes/admin/shipments.routes.ts`, `backend/src/controllers/admin/shipments.controller.ts`
  - **Database Models**: `shipments`, `shipment_status_history` (`shipment_status` enum).
  - **Acceptance Criteria**: Mutates status and records entry in `shipment_status_history`.

- [x] **T043** `[P]` `[Phase 8]` `[US2]` Implement Shipment Details & Tracking API `GET /api/v1/admin/shipments/:id`.
  - **Objective**: Fetch complete shipment overview, shipped items, and carrier tracking history.
  - **Files**: `backend/src/routes/admin/shipments.routes.ts`, `backend/src/controllers/admin/shipments.controller.ts`
  - **Database Models**: `shipments`, `shipment_items`, `shipment_status_history`.
  - **Acceptance Criteria**: Returns full package tracking details.

---

## Phase 9: Payments & Invoices

- [x] **T044** `[P]` `[Phase 9]` `[US1]` Implement Payment Oversight List API `GET /api/v1/admin/payments`.
  - **Objective**: Read-only list of payment records filterable by provider, payment status, and order ID.
  - **Files**: `backend/src/routes/admin/payments.routes.ts`, `backend/src/controllers/admin/payments.controller.ts`
  - **Database Models**: `payments`, `orders` (`payment_status` enum).
  - **Acceptance Criteria**: Excludes sensitive tokens; displays provider transaction IDs.

- [x] **T045** `[P]` `[Phase 9]` `[US1]` Implement Payment Transactions Log API `GET /api/v1/admin/payments/:id/transactions`.
  - **Objective**: View detailed gateway transaction attempts (`payment_transactions`) for a payment.
  - **Files**: `backend/src/routes/admin/payments.routes.ts`, `backend/src/controllers/admin/payments.controller.ts`
  - **Database Models**: `payment_transactions` (`payment_transaction_type` enum).
  - **Acceptance Criteria**: Returns transaction types (`AUTHORIZATION`, `CAPTURE`, `SALE`, `REFUND`).

- [x] **T046** `[P]` `[Phase 9]` `[US1]` Implement Invoice List API `GET /api/v1/admin/invoices`.
  - **Objective**: List billing invoices filterable by invoice status, order ID, and date range.
  - **Files**: `backend/src/routes/admin/invoices.routes.ts`, `backend/src/controllers/admin/invoices.controller.ts`
  - **Database Models**: `invoices`, `orders` (`invoice_status` enum).
  - **Acceptance Criteria**: Displays invoice totals, tax, discount, and status.

- [x] **T047** `[P]` `[Phase 9]` `[US1]` Implement Invoice PDF Generation Endpoint `GET /api/v1/admin/invoices/:id/pdf`.
  - **Objective**: Generate printable invoice PDF metadata and summary for an order.
  - **Files**: `backend/src/routes/admin/invoices.routes.ts`, `backend/src/controllers/admin/invoices.controller.ts`
  - **Database Models**: `invoices`, `orders`, `order_items`, `addresses`.
  - **Acceptance Criteria**: Returns invoice layout payload ready for PDF rendering/download.

---

## Phase 10: Marketing & Coupons

- [x] **T048** `[Phase 10]` `[US1]` Implement Coupon List API `GET /api/v1/admin/coupons`.
  - **Objective**: List promotional coupons filterable by code, discount type, active status, and date range.
  - **Files**: `backend/src/routes/admin/coupons.routes.ts`, `backend/src/controllers/admin/coupons.controller.ts`, `backend/src/services/admin/coupons.service.ts`
  - **Database Models**: `coupons` (`discount_type` enum).
  - **Acceptance Criteria**: Displays discount details, usage counts, and expiration dates.

- [x] **T049** `[Phase 10]` `[US1]` Implement Coupon Creation API `POST /api/v1/admin/coupons`.
  - **Objective**: Create new coupon code with discount value, usage limits, minimum order amount, and validity window.
  - **Files**: `backend/src/routes/admin/coupons.routes.ts`, `backend/src/controllers/admin/coupons.controller.ts`, `backend/src/validators/admin/coupons.validator.ts`
  - **Database Models**: `coupons`.
  - **Acceptance Criteria**: Enforces unique uppercase coupon code constraint.

- [x] **T050** `[Phase 10]` `[US1]` Implement Coupon Product/Category Scope Assignment API `PUT /api/v1/admin/coupons/:id/scope`.
  - **Objective**: Restrict coupon usage to specific products (`coupon_products`) or categories (`coupon_categories`).
  - **Files**: `backend/src/routes/admin/coupons.routes.ts`, `backend/src/controllers/admin/coupons.controller.ts`
  - **Transaction**: `prisma.$transaction` updating `coupon_products` and `coupon_categories`.
  - **Acceptance Criteria**: Atomically replaces scope restrictions.

- [x] **T051** `[P]` `[Phase 10]` `[US1]` Implement Coupon Usage History API `GET /api/v1/admin/coupons/:id/usages`.
  - **Objective**: Inspect customer usage history for a specific coupon (`coupon_usages`).
  - **Files**: `backend/src/routes/admin/coupons.routes.ts`, `backend/src/controllers/admin/coupons.controller.ts`
  - **Database Models**: `coupon_usages`, `users`, `orders`.
  - **Acceptance Criteria**: Displays customer name, order number, and timestamp.

- [x] **T052** `[P]` `[Phase 10]` `[US1]` Implement Coupon Toggle Status API `PATCH /api/v1/admin/coupons/:id/status`.
  - **Objective**: Activate or deactivate coupon (`is_active`).
  - **Files**: `backend/src/routes/admin/coupons.routes.ts`, `backend/src/controllers/admin/coupons.controller.ts`
  - **Database Models**: `coupons`.
  - **Acceptance Criteria**: Toggles `is_active` boolean and logs audit record.

---

## Phase 11: Reviews & Moderation

- [x] **T053** `[P]` `[Phase 11]` `[US1]` Implement Review Moderation List API `GET /api/v1/admin/reviews`.
  - **Objective**: Filterable review list by rating, published state (`is_published`), verified purchase flag, and product ID.
  - **Files**: `backend/src/routes/admin/reviews.routes.ts`, `backend/src/controllers/admin/reviews.controller.ts`, `backend/src/services/admin/reviews.service.ts`
  - **Database Models**: `reviews`, `users`, `products`, `review_images`.
  - **Acceptance Criteria**: Returns reviews with user name, star rating, comment, and attached photo gallery.

- [x] **T054** `[Phase 11]` `[US1]` Implement Review Publish Toggle API `PATCH /api/v1/admin/reviews/:id/publish`.
  - **Objective**: Publish or unpublish product review (`is_published`).
  - **Files**: `backend/src/routes/admin/reviews.routes.ts`, `backend/src/controllers/admin/reviews.controller.ts`
  - **Database Models**: `reviews`.
  - **Acceptance Criteria**: Updates `is_published` flag, affecting public storefront visibility.

- [x] **T055** `[P]` `[Phase 11]` `[US1]` Implement Review Soft Delete API `DELETE /api/v1/admin/reviews/:id`.
  - **Objective**: Remove inappropriate or spam reviews from platform.
  - **Files**: `backend/src/routes/admin/reviews.routes.ts`, `backend/src/controllers/admin/reviews.controller.ts`
  - **Database Models**: `reviews`.
  - **Acceptance Criteria**: Deletes review and attached image references cleanly.

- [x] **T056** `[P]` `[Phase 11]` `[US1]` Implement Review Details API `GET /api/v1/admin/reviews/:id`.
  - **Objective**: View complete review details, product reference, and customer verification state.
  - **Files**: `backend/src/routes/admin/reviews.routes.ts`, `backend/src/controllers/admin/reviews.controller.ts`
  - **Database Models**: `reviews`, `review_images`, `products`, `users`.
  - **Acceptance Criteria**: Returns full review details and gallery image list.

---

## Phase 12: Returns & Refunds

- [x] **T057** `[Phase 12]` `[US4]` Implement Return Requests List API `GET /api/v1/admin/returns`.
  - **Objective**: Filterable return request list by `return_status` and `return_reason`.
  - **Files**: `backend/src/routes/admin/returns.routes.ts`, `backend/src/controllers/admin/returns.controller.ts`, `backend/src/services/admin/returns.service.ts`
  - **Database Models**: `returns`, `orders`, `users` (`return_status`, `return_reason` enums).
  - **Acceptance Criteria**: Displays return reference number, customer name, reason, and status.

- [x] **T058** `[Phase 12]` `[US4]` Implement Return Details & Items Inspection API `GET /api/v1/admin/returns/:id`.
  - **Objective**: Detailed return inspection view showing returned items (`return_items`), customer notes, and admin notes.
  - **Files**: `backend/src/routes/admin/returns.routes.ts`, `backend/src/controllers/admin/returns.controller.ts`
  - **Database Models**: `returns`, `return_items`, `order_items`.
  - **Acceptance Criteria**: Displays specific line items and quantities being returned.

- [x] **T059** `[Phase 12]` `[US4]` Implement Return Status Shift API `PATCH /api/v1/admin/returns/:id/status`.
  - **Objective**: Process return request through inspection workflow (`REQUESTED` → `APPROVED` → `RECEIVED` → `INSPECTED` → `REFUNDED` / `REJECTED`).
  - **Files**: `backend/src/routes/admin/returns.routes.ts`, `backend/src/controllers/admin/returns.controller.ts`, `backend/src/validators/admin/returns.validator.ts`
  - **Database Models**: `returns` (`return_status` enum).
  - **Acceptance Criteria**: Updates return status and records admin notes.

- [x] **T060** `[P]` `[Phase 12]` `[US4]` Implement Refund List API `GET /api/v1/admin/refunds`.
  - **Objective**: Filterable list of issued refunds by `refund_status`, order ID, and date range.
  - **Files**: `backend/src/routes/admin/refunds.routes.ts`, `backend/src/controllers/admin/refunds.controller.ts`, `backend/src/services/admin/refunds.service.ts`
  - **Database Models**: `refunds`, `orders` (`refund_status` enum).
  - **Acceptance Criteria**: Displays refund reference, total amount, provider transaction ID, and status.

- [x] **T061** `[Phase 12]` `[US4]` Implement Transactional Refund Processing API `POST /api/v1/admin/refunds/process`.
  - **Objective**: Process partial or full monetary refund for an order/return.
  - **Files**: `backend/src/routes/admin/refunds.routes.ts`, `backend/src/controllers/admin/refunds.controller.ts`, `backend/src/validators/admin/refunds.validator.ts`
  - **Transaction**: `prisma.$transaction` creating `refunds` entry, recording `payment_transactions` (`REFUND`), updating `payments.payment_status`, and updating `orders.order_status` (`REFUNDED` or `PARTIALLY_REFUNDED`).
  - **Acceptance Criteria**: Atomically commits financial refund records and logs audit event.

- [x] **T062** `[P]` `[Phase 12]` `[US4]` Implement Refund Details API `GET /api/v1/admin/refunds/:id`.
  - **Objective**: View refund transaction breakdown, linked return, and gateway payment reference.
  - **Files**: `backend/src/routes/admin/refunds.routes.ts`, `backend/src/controllers/admin/refunds.controller.ts`
  - **Database Models**: `refunds`, `payments`, `returns`.
  - **Acceptance Criteria**: Returns full refund audit receipt data.

---

## Phase 13: Audit Logs

- [x] **T063** `[Phase 13]` `[US1]` Implement Audit Logger Service `AuditService.logAction` in `backend/src/services/admin/audit.service.ts`.
  - **Objective**: Reusable service writing immutable records to `audit_logs`.
  - **Files**: `backend/src/services/admin/audit.service.ts`
  - **Database Models**: `audit_logs`.
  - **Acceptance Criteria**: Writes `user_id`, `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `ip_address`, `user_agent`.

- [x] **T064** `[P]` `[Phase 13]` `[US1]` Implement Audit Logs Inspection API `GET /api/v1/admin/audit-logs`.
  - **Objective**: Read-only search & filter API for system audit log events.
  - **Files**: `backend/src/routes/admin/auditLogs.routes.ts`, `backend/src/controllers/admin/auditLogs.controller.ts`
  - **Database Models**: `audit_logs`, `users`.
  - **Authorization**: Requires `SUPER_ADMIN` role or `audit_logs:read` permission.
  - **Acceptance Criteria**: Returns paginated audit logs; no update/delete endpoints exist.

- [x] **T065** `[P]` `[Phase 13]` `[US1]` Implement Sensitive Data Redaction in Audit Payload Serialization.
  - **Objective**: Redact passwords, credit card tokens, and secret keys in `old_values` / `new_values` JSON.
  - **Files**: `backend/src/services/admin/audit.service.ts`
  - **Acceptance Criteria**: Replaces sensitive key strings with `[REDACTED]`.

---

## Phase 14: Testing & Security Hardening

- [x] **T066** `[P]` `[Phase 14]` Write Admin Authentication & Authorization Middleware Unit Tests in `backend/tests/admin/auth.test.ts`.
  - **Objective**: Verify unauthenticated/unauthorized requests to `/api/v1/admin/*` are blocked with `401`/`403`.
  - **Files**: `backend/tests/admin/auth.test.ts`
  - **Acceptance Criteria**: 100% of unauthorized scenarios pass.

- [x] **T067** `[P]` `[Phase 14]` Write Product Catalog API Integration Tests in `backend/tests/admin/products.test.ts`.
  - **Objective**: Test product creation, variant generation, category mapping, and archive workflows.
  - **Files**: `backend/tests/admin/products.test.ts`
  - **Acceptance Criteria**: Product CRUD workflow passes end-to-end.

- [x] **T068** `[P]` `[Phase 14]` Write Inventory Stock Adjustment & Concurrency Tests in `backend/tests/admin/inventory.test.ts`.
  - **Objective**: Test concurrent stock adjustment requests and verify negative stock validation.
  - **Files**: `backend/tests/admin/inventory.test.ts`
  - **Acceptance Criteria**: Prevents negative stock on hand and generates accurate movement logs under load.

- [x] **T069** `[P]` `[Phase 14]` Write Order Status State Machine Transition Tests in `backend/tests/admin/orders.test.ts`.
  - **Objective**: Test valid order status transitions and verify invalid transition rejections.
  - **Files**: `backend/tests/admin/orders.test.ts`
  - **Acceptance Criteria**: Rejects illegal transitions (e.g. `DELIVERED` → `PENDING`) with HTTP `400`.

- [x] **T070** `[P]` `[Phase 14]` Write After-Sales Refund Transaction Integration Tests in `backend/tests/admin/refunds.test.ts`.
  - **Objective**: Test return approval and refund processing transactions.
  - **Files**: `backend/tests/admin/refunds.test.ts`
  - **Acceptance Criteria**: Updates order payment status and creates payment transaction records.

- [x] **T071** `[P]` `[Phase 14]` Write Privilege Escalation Protection Security Tests in `backend/tests/admin/rbac.test.ts`.
  - **Objective**: Verify non-super-admin users cannot elevate privileges or grant `SUPER_ADMIN` roles.
  - **Files**: `backend/tests/admin/rbac.test.ts`
  - **Acceptance Criteria**: Privilege escalation attempts return HTTP `403 Forbidden`.

- [x] **T072** `[Phase 14]` Execute Quickstart Validation Suite across all Admin Modules.
  - **Objective**: Execute runnable quickstart validation guide in `specs/003-admin-panel/quickstart.md`.
  - **Files**: All admin modules.
  - **Acceptance Criteria**: All quickstart scenarios pass cleanly.
