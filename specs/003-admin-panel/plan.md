# Complete Technical Implementation Plan: AIRAVÉ Admin Panel

**Branch**: `003-admin-panel` | **Date**: 2026-08-19 | **Spec**: [spec.md](file:///d:/CS-Next/specs/003-admin-panel/spec.md)  
**Input**: Feature specification from `specs/003-admin-panel/spec.md`, source of truth `backend/DATABASE_DESIGN.md`, and business workflows from `admin/AIRAVE_ADMIN_PANEL_PLAN.md`.

---

## 1. Existing Architecture Analysis

The existing backend is a **Node.js 20+ Express ESM TypeScript** application using **Prisma 6+ ORM** connected to a **PostgreSQL 16+** database.

### Existing Backend Infrastructure
- **Framework**: Express (`app.ts`, `server.ts`) with ESM imports (`.js` extension resolution).
- **ORM / Database**: Prisma Client connected via `backend/src/lib/prisma.ts`.
- **Response & Error Handling**:
  - Response helper: `backend/src/utils/response.ts` (`sendSuccess`, `sendError`).
  - Error classes: `backend/src/utils/errors.ts` (`AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`).
  - Centralized middleware: `backend/src/middleware/errorHandler.ts`.
- **Validation**: Zod schema validation via `backend/src/middleware/validate.ts` (`validateRequest`).
- **Security & Rate Limiting**: Helmet, CORS, Morgan logging, `express-rate-limit` in `backend/src/middleware/rateLimiter.js`.
- **Authentication**: JWT token verification in `backend/src/middleware/auth.ts` setting `req.user`.
- **Authorization**: Basic role check helper in `backend/src/middleware/rbac.ts`.

### Needed New Admin Infrastructure (Needs to be Created)
- **Granular Permission Middleware**: `requirePermission(permissionString)` checking `users` → `user_roles` → `roles` → `role_permissions` → `permissions`.
- **Admin Query Parser Utility**: Reusable pagination, sorting, and filter sanitizer preventing raw Prisma clause injection.
- **Audit Logger Helper**: Reusable `auditService.logAction()` writing immutable records to `audit_logs`.
- **Modular Admin Routes & Controllers**: Dedicated `/api/v1/admin/*` route tree grouped by domain services.

---

## 2. Database & Model Mapping

Every Admin Panel module maps 1:1 to existing Prisma models without modifying `schema.prisma`:

| Admin Module | Primary Prisma Model(s) | Key Fields / Relations | Database Enums Used |
|---|---|---|---|
| **Dashboard** | `orders`, `inventories`, `users`, `returns`, `refunds` | Aggregate queries (`count`, `sum`, `groupBy`) | `order_status`, `user_status`, `return_status` |
| **Products** | `products`, `product_categories`, `product_collections` | `id`, `title`, `slug`, `status`, `visibility`, `base_price`, `compare_at_price`, `cost_price` | `product_status`, `product_visibility` |
| **Categories** | `categories`, `product_categories` | `id`, `name`, `slug`, `parent_id`, `status`, `is_primary` | `category_status` |
| **Collections** | `collections`, `product_collections` | `id`, `title`, `slug`, `is_featured`, `published_at`, `sort_order` | N/A |
| **Attributes** | `attributes`, `attribute_values` | `id`, `name`, `type`, `is_filterable`, `value`, `hex_color` | N/A |
| **Variants** | `product_variants`, `product_variant_attribute_values` | `id`, `sku`, `barcode`, `price`, `weight`, `is_default`, `is_active` | N/A |
| **Product Media** | `product_images` | `id`, `url`, `alt_text`, `display_order` | N/A |
| **Inventory** | `inventories`, `inventory_movements`, `inventory_reservations` | `quantity_on_hand`, `quantity_reserved`, `reorder_level`, `available_quantity` | `inventory_movement_type` |
| **Customers** | `users`, `addresses` | `email`, `first_name`, `last_name`, `phone`, `status`, `last_login_at` | `user_status`, `address_type` |
| **Orders** | `orders`, `order_items`, `order_status_history` | `order_number`, `order_status`, `payment_status`, `shipment_status`, `total_amount` | `order_status`, `payment_status`, `shipment_status` |
| **Shipments** | `shipments`, `shipment_items`, `shipment_status_history` | `tracking_number`, `carrier`, `shipment_status`, `estimated_delivery_at` | `shipment_status` |
| **Payments** | `payments`, `payment_transactions` | `provider`, `provider_payment_id`, `payment_status`, `amount`, `currency` | `payment_status`, `payment_transaction_type` |
| **Invoices** | `invoices` | `invoice_number`, `invoice_status`, `subtotal`, `tax_total`, `grand_total` | `invoice_status` |
| **Coupons** | `coupons`, `coupon_products`, `coupon_categories`, `coupon_usages` | `code`, `discount_type`, `discount_value`, `usage_limit`, `is_active` | `discount_type` |
| **Reviews** | `reviews`, `review_images` | `rating`, `title`, `comment`, `is_published`, `verified_purchase` | N/A |
| **Returns** | `returns`, `return_items` | `return_number`, `return_status`, `return_reason`, `admin_notes` | `return_status`, `return_reason` |
| **Refunds** | `refunds` | `refund_number`, `refund_status`, `amount`, `provider_refund_id` | `refund_status` |
| **Admin Users** | `users`, `user_roles` | Admin accounts linked to role assignments | `user_status` |
| **RBAC** | `roles`, `permissions`, `role_permissions` | Permission string mappings and privilege levels | N/A |
| **Audit Logs** | `audit_logs` | Immutable event trail (`user_id`, `entity_type`, `action`, `old_values`, `new_values`) | N/A |

---

## 3. Admin API Architecture

All admin routes live under `/api/v1/admin` and follow standard controller-service separation:

### Middleware Sequence for `/api/v1/admin/*`
1. `authMiddleware`: Validates JWT token, attaches `req.user` with user ID and assigned role names.
2. `requireAdminStatus`: Ensures `req.user.status === 'ACTIVE'`.
3. `requirePermission('domain:action')`: Queries `roles` → `role_permissions` → `permissions` to confirm permission string grant.
4. `validateRequest(schema)`: Validates body, query, and params using Zod.

### Router Overview
- `/dashboard` (GET)
- `/products` (GET, POST, GET /:id, PUT /:id, DELETE /:id)
- `/categories` (GET, POST, PUT /:id, DELETE /:id)
- `/collections` (GET, POST, PUT /:id, DELETE /:id)
- `/attributes` (GET, POST, PUT /:id, DELETE /:id)
- `/inventory` (GET, POST /adjust, GET /movements)
- `/orders` (GET, GET /:id, PATCH /:id/status)
- `/shipments` (GET, POST, PATCH /:id/status)
- `/payments` (GET, GET /:id)
- `/invoices` (GET, GET /:id/pdf)
- `/customers` (GET, GET /:id, PATCH /:id/status)
- `/coupons` (GET, POST, PUT /:id)
- `/reviews` (GET, PATCH /:id/publish)
- `/returns` (GET, PATCH /:id/status)
- `/refunds` (GET, POST /process)
- `/admin-users` (GET, POST, PUT /:id)
- `/roles` (GET, POST, PUT /:id)
- `/audit-logs` (GET)

---

## 4. Technical Plans for Key Business Workflows

### 1. Transactional Inventory Adjustment
```typescript
await prisma.$transaction(async (tx) => {
  const inventory = await tx.inventories.findUniqueOrThrow({ where: { variant_id } });
  const newHand = inventory.quantity_on_hand + quantity_change;
  if (newHand < 0) throw new ValidationError("Insufficient stock on hand for adjustment");

  await tx.inventories.update({
    where: { id: inventory.id },
    data: { quantity_on_hand: newHand }
  });

  await tx.inventory_movements.create({
    data: {
      inventory_id: inventory.id,
      user_id: adminUserId,
      movement_type: movementType, // 'PURCHASE', 'ADJUSTMENT', 'DAMAGE', etc.
      quantity_change: quantity_change,
      notes: notes
    }
  });

  await auditService.logAction(tx, adminUserId, 'Inventory', inventory.id, 'ADJUST', { old: inventory.quantity_on_hand }, { new: newHand });
});
```

### 2. Order Status State Machine Transition
Valid Transitions:
- `PENDING` → `CONFIRMED`, `CANCELLED`, `FAILED`
- `CONFIRMED` → `PROCESSING`, `CANCELLED`
- `PROCESSING` → `SHIPPED`, `CANCELLED`
- `SHIPPED` → `DELIVERED`, `PARTIALLY_REFUNDED`, `REFUNDED`
- `DELIVERED` → `PARTIALLY_REFUNDED`, `REFUNDED`

```typescript
await prisma.$transaction(async (tx) => {
  const order = await tx.orders.findUniqueOrThrow({ where: { id: orderId } });
  validateStatusTransition(order.order_status, newStatus); // Throws ValidationError if invalid

  await tx.orders.update({
    where: { id: orderId },
    data: { order_status: newStatus }
  });

  await tx.order_status_history.create({
    data: {
      order_id: orderId,
      previous_status: order.order_status,
      new_status: newStatus,
      changed_by_user_id: adminUserId,
      reason_notes: notes
    }
  });
});
```

---

## 5. Filtering, Pagination & Sorting Architecture

### Universal Sanitizer (`parseAdminQueryParams`)
```typescript
interface AdminQueryParams {
  page: number;         // Default: 1
  limit: number;        // Default: 20, Max: 100
  sortBy: string;       // Whitelisted column
  sortOrder: 'asc' | 'desc'; // Default: 'desc'
  search?: string;
  filters: Record<string, any>;
}
```
- Client payload parameters are explicitly validated against a white-list per endpoint using Zod.
- Direct Prisma `where` or `orderBy` JSON objects from clients are strictly forbidden to prevent SQL/noSQL injection vulnerabilities.

---

## 6. Security & Privilege Escalation Protection

- **Privilege Escalation Gate**: An admin user updating another user's roles cannot grant the `SUPER_ADMIN` role unless `req.user` is already a `SUPER_ADMIN`.
- **Sensitive Data Safeguards**: Password hashes (`password_hash`) and full payment tokens are automatically excluded using Prisma `select` / `omit` mappings.
- **Audit Log Immutability**: No API routes or database queries exist to edit or delete rows in `audit_logs`.

---

## 7. Project File Structure

Location of all Admin Panel files within `d:\CS-Next\backend`:

```text
backend/src/
├── routes/
│   ├── admin/
│   │   ├── index.ts
│   │   ├── dashboard.routes.ts
│   │   ├── products.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── collections.routes.ts
│   │   ├── attributes.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── shipments.routes.ts
│   │   ├── payments.routes.ts
│   │   ├── invoices.routes.ts
│   │   ├── customers.routes.ts
│   │   ├── coupons.routes.ts
│   │   ├── reviews.routes.ts
│   │   ├── returns.routes.ts
│   │   ├── refunds.routes.ts
│   │   ├── adminUsers.routes.ts
│   │   ├── roles.routes.ts
│   │   └── auditLogs.routes.ts
├── controllers/
│   └── admin/
│       ├── dashboard.controller.ts
│       ├── products.controller.ts
│       ├── inventory.controller.ts
│       ├── orders.controller.ts
│       └── ...
├── services/
│   └── admin/
│       ├── dashboard.service.ts
│       ├── products.service.ts
│       ├── inventory.service.ts
│       ├── orders.service.ts
│       ├── audit.service.ts
│       └── ...
├── validators/
│   └── admin/
│       ├── products.validator.ts
│       ├── inventory.validator.ts
│       ├── orders.validator.ts
│       └── ...
└── middleware/
    ├── adminAuth.ts
    └── rbac.ts (Updated for granular permission checks)
```

---

## 8. Implementation Phases

- **Phase 1: Admin Core Infrastructure**: Extended RBAC middleware (`requirePermission`), response sanitizer, Zod query parser, Audit Service.
- **Phase 2: Administration & RBAC Modules**: Admin Users, Roles, Permissions, and Audit Log inspection.
- **Phase 3: Operational Dashboard**: Metrics aggregation queries (sales totals, status counters, stock alerts).
- **Phase 4: Catalog Management**: Products, Categories, Collections, Attributes, Variants, Images.
- **Phase 5: Inventory Operations**: Stock list, transaction-safe adjustments, movements history.
- **Phase 6: Customers & Users**: Customer details, address book, status toggle.
- **Phase 7: Order Management**: Order list, order details, status transitions with `order_status_history`.
- **Phase 8: Fulfillment & Shipments**: Package creation, carrier tracking, shipment status shifts.
- **Phase 9: Payments & Invoices**: Read-only payment transaction log, invoice breakdown & PDF generator.
- **Phase 10: Marketing & Coupons**: Coupon creation, category/product scope, usage logs.
- **Phase 11: Engagement & Reviews**: Review moderation, publishing toggle.
- **Phase 12: After Sales (Returns & Refunds)**: Return inspections, return item mapping, refund transaction processing.
- **Phase 13: End-to-End Testing**: Integration tests for status transitions, concurrency stock updates, and privilege security.

---

## 9. Risks & Dependencies

- **Database Integrity**: High dependency on proper PostgreSQL index coverage for status queries (`orders.order_status`, `products.status`, `users.status`).
- **Concurrent Stock Adjustments**: Prevented via `prisma.$transaction` and strict stock calculations (`available_quantity = quantity_on_hand - quantity_reserved`).

---

## 10. Items Flagged for Business or Schema Clarification

- **REQUIRES BUSINESS DECISION**: Confirmation of exact refund provider integration hooks (e.g. automatic Stripe refund vs manual ledger entry for Cash on Delivery).
- **REQUIRES DATABASE CHANGE**: None. The implementation plan strictly utilizes the established schema in `backend/DATABASE_DESIGN.md`.
