# Feature Specification: Complete AIRAVÉ Admin Panel

**Feature Branch**: `003-admin-panel`  
**Created**: 2026-08-19  
**Status**: Draft  
**Input**: Business-oriented Admin Panel Specification derived strictly from `backend/DATABASE_DESIGN.md` and `admin/AIRAVE_ADMIN_PANEL_PLAN.md`.

---

## 1. Problem Statement

The AIRAVÉ single-brand fashion e-commerce platform currently lacks a dedicated administrative interface for platform operations. Business stakeholders, inventory managers, customer support agents, and catalog managers require a centralized, operational workspace to oversee sales, manage product catalogs, execute stock adjustments, fulfill shipments, handle returns/refunds, evaluate customer reviews, issue promotional coupons, and audit security events. The admin panel must provide tailored business workflows rather than generic CRUD table views, enforcing strict database relationships, state transitions, transaction boundaries, and role-based access control (RBAC).

---

## 2. Goals

- Provide a business-oriented, operational Admin Panel supporting 11 core navigation groups (Dashboard, Catalog, Inventory, Sales, Customers, Marketing, Engagement, After Sales, Administration).
- Strictly map all administrative actions to existing PostgreSQL schema entities, enums, constraints, and relationships documented in `backend/DATABASE_DESIGN.md`.
- Implement security-first RBAC authorization boundaries at the backend API layer (`/api/v1/admin/*`), using `users`, `user_roles`, `roles`, `role_permissions`, and `permissions` with zero privilege escalation.
- Support transaction-safe inventory adjustments (generating `inventory_movements` and respecting `available_quantity = quantity_on_hand - quantity_reserved`).
- Enforce rigid order, shipment, return, and refund status state-machine transitions with audit tracking (`order_status_history`, `shipment_status_history`, `audit_logs`).
- Define explicit server-side filtering, pagination, and sorting for all high-volume admin lists.

---

## 3. Non-Goals

- **NO Schema Mutations**: No modification of Prisma models, PostgreSQL enums, database columns, foreign keys, or database migrations.
- **NO Generic Database GUI**: No arbitrary raw table editing that bypasses business logic or state machine checks.
- **NO Direct Payment Status Mutations**: No manual overrides of external gateway tokens or payment status without real provider verification/refund workflows.
- **NO Frontend-Only Security**: Frontend role visibility checks are strictly for UX; unauthorized API requests MUST be rejected at the backend middleware layer.
- **NO Independent CRUD Pages for Join/History Tables**: Entities like `order_items`, `order_status_history`, `inventory_movements`, `product_categories`, and `role_permissions` will only be managed through their parent business modules.

---

## 4. Existing Database Dependencies

All functionality is built on the established schema defined in `backend/DATABASE_DESIGN.md`:

- **User & RBAC Layer**: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `audit_logs`
- **Catalog Layer**: `products`, `categories`, `product_categories`, `collections`, `product_collections`, `attributes`, `attribute_values`, `product_variants`, `product_variant_attribute_values`, `product_images`
- **Inventory Layer**: `inventories`, `inventory_movements`, `inventory_reservations`
- **Sales & Orders Layer**: `orders`, `order_items`, `order_status_history`, `addresses`, `shipments`, `shipment_items`, `shipment_status_history`, `payments`, `payment_transactions`, `invoices`
- **Marketing & Engagement**: `coupons`, `coupon_categories`, `coupon_products`, `coupon_usages`, `reviews`, `review_images`
- **After Sales Layer**: `returns`, `return_items`, `refunds`

---

## 5. Admin Roles and Permissions

- **Authentication Requirement**: All `/api/v1/admin/*` endpoints require valid JWT authentication with active `user.status = 'ACTIVE'`.
- **RBAC Entity Model**:
  - `ADMIN` role: Access to day-to-day operational workflows (Catalog, Inventory, Orders, Shipments, Customers, Reviews, Returns).
  - `SUPER_ADMIN` role: Unrestricted access, including Admin User management, Role & Permission assignment, and System Audit Log inspection.
- **Privilege Escalation Protection**:
  - An administrator cannot grant permissions or assign roles exceeding their own granted permissions.
  - Non-`SUPER_ADMIN` users cannot modify `SUPER_ADMIN` accounts, permissions, or system audit configurations.
  - API middleware verifies explicit permission strings (e.g., `products:create`, `orders:update_status`, `inventory:adjust`, `refunds:process`).

---

## 6. Admin Navigation

Structure of the Admin Navigation Workspace:

```
DASHBOARD
  └── Overview & Metrics

CATALOG
  ├── Products (Top-Level)
  ├── Categories (Top-Level)
  ├── Collections (Top-Level)
  └── Attributes (Top-Level)

INVENTORY
  ├── Inventory (Top-Level)
  ├── Inventory Movements (Read-Oriented / Log View)
  └── Reservations (Read-Only / Active Hold View)

SALES
  ├── Orders (Top-Level)
  ├── Shipments (Top-Level)
  ├── Payments (Top-Level - Read-Oriented)
  └── Invoices (Top-Level - Read/PDF View)

CUSTOMERS
  └── Customers (Top-Level)

MARKETING
  └── Coupons (Top-Level)

ENGAGEMENT
  └── Reviews (Top-Level)

AFTER SALES
  ├── Returns (Top-Level)
  └── Refunds (Top-Level)

ADMINISTRATION
  ├── Admin Users (Top-Level)
  ├── Roles & Permissions (Top-Level)
  └── Audit Logs (Read-Only)
```

- **Top-Level Resources**: Primary business modules with dedicated list/detail operational interfaces.
- **Nested Resources**: `product_variants`, `product_images`, `order_items`, `shipment_items`, `return_items` (managed within their respective parent resource views).
- **Read-Only / Log Resources**: `audit_logs`, `inventory_movements`, `order_status_history`, `payment_transactions`, `invoices`.
- **Supporting / Join Resources**: `product_categories`, `product_collections`, `user_roles`, `role_permissions`, `coupon_products`, `coupon_categories`.

---

## 7. Dashboard Requirements

- **Supported Operational Metrics**:
  - **Orders**: Total Order Count, Today's Orders.
  - **Sales Totals**: Gross Revenue, Net Revenue (calculated from `orders.total_amount` filtering out `CANCELLED` and `REFUNDED`).
  - **Order Status Breakdown**: Count of `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED` orders.
  - **After Sales Pipeline**: Count of `REQUESTED` / `PENDING` Returns and `PROCESSING` Refunds.
  - **Inventory Health Alerts**: Count of Low-Stock Variants (`available_quantity <= reorder_level`) and Out-of-Stock Variants (`available_quantity = 0`).
  - **Customer Insights**: Total Registered Customers (`users.status = 'ACTIVE'`).
- **Date Range Filters**: Presets (Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Custom Range).
- **Widgets**:
  - Sales & Revenue Trend Chart
  - Recent Orders Feed (Last 10 orders with instant status transition shortcuts)
  - Inventory Alert Table (SKUs reaching reorder thresholds)
  - Audit Trail Activity Feed (Latest admin mutations)

---

## 8. Product Requirements

- **List View Capabilities**:
  - Search by Product Title, Slug, Description.
  - Filters: Status (`DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `ARCHIVED`), Visibility (`PUBLIC`, `PRIVATE`, `HIDDEN`), Category ID, Collection ID, Price Range.
  - Sorting: `created_at`, `updated_at`, `title`, `base_price`.
- **Product Management Workflow**:
  - **Create**: Basic details (title, slug, description, short_description, status, visibility, base_price, compare_at_price, cost_price, SKU, barcode).
  - **Category Association**: Assign primary category (`is_primary = true`) and optional secondary categories via `product_categories`.
  - **Collection Association**: Assign to collections with ordering (`product_collections.sort_order`).
  - **Attribute & Variant Setup**: Define filterable attributes and generate/manage child `product_variants`.
  - **Media Management**: Upload gallery images into `product_images` with display ordering (`display_order`) and alt text.
  - **Publishing Actions**: Toggle `status` (`DRAFT` → `ACTIVE` → `ARCHIVED`) and `visibility` with audit logging.

---

## 9. Category Requirements

- **Tree & List Views**: Hierarchy supporting `parent_id` recursive nesting.
- **Form Controls**: Category Name, Slug, Description, Parent Category, Status (`ACTIVE`, `INACTIVE`), Display Order, Category Image URL.
- **Constraints**: Prevent circular parent-child assignment (`parent_id != id`). Deactivating a parent category optionally flags sub-category warnings in UX.

---

## 10. Collection Requirements

- **Collection Management**: Title, Slug, Description, Image URL, Featured Flag (`is_featured`), Status (`ACTIVE`, `INACTIVE`), Start/End Publish Dates (`published_at`, `expires_at`).
- **Product Assignment Modal**: Search catalog products, bulk assign/remove, drag-and-drop sort order (`product_collections.sort_order`).

---

## 11. Attribute Requirements

- **Attribute Definition**: Name (e.g., "Size", "Color", "Material"), Type (`SELECT`, `COLOR`, `BUTTON`), Searchable/Filterable Flags (`is_filterable`, `is_visible`).
- **Attribute Values**: Value text (e.g., "Large", "Olive Green"), Hex Color Code (e.g., `#556B2F`), Display Sort Order.

---

## 12. Variant Requirements

- **Fields Supported**: SKU (unique), Barcode, Variant Name, Price, Compare-At Price, Cost Price, Weight, Dimensions, Is Default (`is_default`), Active State (`is_active`).
- **Variant Attributes**: Assign specific `attribute_values` to variants via `product_variant_attribute_values`.
- **Inventory Linking**: Automatic initial `inventories` row creation for newly generated variants.
- **Price History**: Tracking historical price shifts via audit records when `price` or `compare_at_price` is updated.

---

## 13. Inventory Requirements

- **Formula**: `available_quantity = quantity_on_hand - quantity_reserved`.
- **List View**: Search SKU, Product Title, Barcode. Filter by Stock Status (In Stock, Low Stock, Out of Stock), Category, Warehouse/Location.
- **Business Operations (Adjustments)**:
  - Inventory updates MUST NOT overwrite `quantity_on_hand` arbitrarily.
  - Mandatory adjustment reason: `PURCHASE` (Stock In), `ADJUSTMENT` (Manual Correction), `DAMAGE`, `LOSS`, `RETURN`.
  - Atomic Transaction: Mutates `inventories.quantity_on_hand` and inserts immutable record into `inventory_movements` with `user_id`, `movement_type`, `quantity_change`, and `notes`.
- **Low Stock Threshold**: Triggers alert when `available_quantity <= reorder_level`.

---

## 14. Order Requirements

- **Unified List View**: Single Order Management interface with rich multi-filter tabs (`All`, `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Search & Filtering**: Search Order Number, Customer Name/Email/Phone, Tracking Number. Filter by `order_status`, `payment_status`, `shipment_status`, Date Range, Total Amount Range.
- **Order Details Drawer/Page**:
  - Order Snapshot: Customer profile link, Immutable Item Lines (`order_items` snapshot price, SKU, title, size, color), Shipping/Billing Address.
  - Payment Details: Associated `payments` and `payment_transactions`.
  - Fulfillment Details: Linked `shipments` and tracking URL.
  - Financial Summary: Subtotal, Shipping Fee, Discount (`coupon_code`), Tax, Grand Total.
  - Timeline: Complete `order_status_history` stream showing timestamps, status shifts, and admin notes.

---

## 15. Order Status Workflow

- **State Machine Enums (`order_status`)**:
  `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`
  *Terminal / Exception States*: `CANCELLED`, `PARTIALLY_CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `FAILED`.
- **Valid Transitions**:
  - `PENDING` → `CONFIRMED`, `CANCELLED`, `FAILED`
  - `CONFIRMED` → `PROCESSING`, `CANCELLED`
  - `PROCESSING` → `SHIPPED`, `CANCELLED`
  - `SHIPPED` → `DELIVERED`, `PARTIALLY_REFUNDED`, `REFUNDED`
  - `DELIVERED` → `PARTIALLY_REFUNDED`, `REFUNDED`
- **Transition Execution**:
  - Mutates `orders.order_status`.
  - Appends record to `order_status_history` with `previous_status`, `new_status`, `changed_by_user_id`, and `reason_notes`.
  - Triggers inventory release transaction if transitioning to `CANCELLED`.

---

## 16. Shipment Requirements

- **Shipment Management**: Tracking Number, Carrier Name, Tracking URL, Estimated Delivery Date, Shipping Method, Package Weight.
- **Shipment Status Flow**: `PENDING` → `PROCESSING` → `PACKED` → `SHIPPED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` (or `RETURNED` / `CANCELLED`).
- **Shipment Creation**: Admin selects unfulfilled `order_items`, assigns quantity to ship, generates `shipment` and `shipment_items` records, and updates order fulfillment state.

---

## 17. Payment Requirements

- **Read-Oriented Oversight**: View payment records linked to orders (`payments` and `payment_transactions`).
- **Fields**: Payment Gateway Provider, Provider Transaction ID, Amount, Currency, Status (`PENDING`, `AUTHORIZED`, `CAPTURED`, `PARTIALLY_REFUNDED`, `REFUNDED`, `FAILED`), Error Code / Message.
- **Security Constraints**: Mask card last-4 digits / gateway tokens. Prevent direct status editing without recorded transaction events.

---

## 18. Invoice Requirements

- **Invoice Features**: Invoice Number, Order ID, Issue Date, Payment Status (`DRAFT`, `ISSUED`, `PAID`, `CANCELLED`, `REFUNDED`), Subtotal, Shipping, Tax, Total Amount.
- **Actions**: View PDF, Download Printable Invoice, Re-send Email Receipt to customer.

---

## 19. Customer Requirements

- **List View**: Search Name, Email, Phone. Filter by `status` (`PENDING`, `ACTIVE`, `SUSPENDED`, `BLOCKED`, `DEACTIVATED`), Email Verified, Created Date Range.
- **Customer Detail View**:
  - Profile Details & Account Status Toggle (`ACTIVE` ↔ `SUSPENDED` / `BLOCKED`).
  - Saved Address Book (`addresses` table).
  - Order History & Total Lifetime Value (LTV).
  - Submitted Product Reviews.
- **Security Constraint**: NEVER expose `password_hash` in UI or API responses.

---

## 20. Coupon Requirements

- **Coupon Definition**: Code (unique uppercase), Description, Discount Type (`FIXED`, `PERCENTAGE`), Discount Value, Minimum Order Amount, Maximum Discount Amount, Usage Limit (Global & Per User), Expiration Range (`start_date`, `end_date`), Active Flag (`is_active`).
- **Scope Associations**:
  - Restrict to specific products (`coupon_products`).
  - Restrict to specific categories (`coupon_categories`).
- **Usage Audit View**: Inspect customer usage history (`coupon_usages`).

---

## 21. Review Requirements

- **Review Moderation List**: Filter by Rating (1-5 Stars), Published State (`is_published`), Verified Purchase Flag, Product, Date Range.
- **Moderation Actions**:
  - **Publish / Unpublish**: Toggle `is_published` visibility on public storefront.
  - **Soft Delete**: Flag inappropriate content.
  - Inspect attached user photos (`review_images`).

---

## 22. Return Requirements

- **Return Workflow**:
  - List View: Filter by `return_status` (`REQUESTED`, `APPROVED`, `REJECTED`, `PICKED_UP`, `RECEIVED`, `INSPECTED`, `REFUNDED`, `CANCELLED`) and `return_reason` (`WRONG_SIZE`, `DAMAGED`, `DEFECTIVE`, `CHANGED_MIND`, etc.).
  - Inspection & Approval: Admin reviews customer return notes/photos, inspects received items, marks condition, and approves/rejects return.
  - Return Items Mapping: Select specific `order_items` and quantities being returned (`return_items`).

---

## 23. Refund Requirements

- **Refund Operations**:
  - Associated Order ID, Return ID, Payment ID, Refund Amount, Reason, Refund Status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`).
  - Processing Execution: Initiate Gateway Refund transaction via payment service, record provider refund reference ID, append `payment_transactions` row, update order financial status to `PARTIALLY_REFUNDED` or `REFUNDED`.

---

## 24. Audit Logging Requirements

- **Immutable Security Log**: Audit records generated automatically for sensitive administrative operations (User Role Changes, Stock Adjustments, Manual Price Overrides, Order Cancellations, Customer Status Modifications, Refund Issuances).
- **Log Fields**: `user_id`, `entity_type` (e.g., "Order", "Product", "User"), `entity_id`, `action` ("CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"), `old_values` (JSON), `new_values` (JSON), `ip_address`, `user_agent`, `created_at`.
- **Constraints**: Log records are strictly READ-ONLY and cannot be updated or deleted by any admin user.

---

## 25. Filtering, Search, Pagination & Sorting Standards

- **Server-Side Filtering**: All administrative list endpoints MUST enforce strict query validation.
- **Allowed Query Parameters**:
  - `page` (integer, default 1)
  - `limit` (integer, default 20, max 100)
  - `sort_by` (whitelisted column name, e.g., `created_at`, `total_amount`)
  - `sort_order` (`asc` or `desc`, default `desc`)
  - `search` (sanitized text string)
  - Enum-specific filters (e.g., `status=ACTIVE`)
  - Date ranges (`from_date`, `to_date` ISO-8601 strings)
- **Protection**: Rejection of raw SQL snippets, arbitrary JSON payload injection, or un-whitelisted Prisma clause objects.

---

## 26. Security Requirements

- **API Security Boundary**: All `/api/v1/admin/*` endpoints MUST pass:
  1. `authenticateAdmin` JWT middleware verifying active token & session.
  2. `authorizePermission(permission_string)` checking `roles` → `role_permissions` → `permissions`.
- **IDOR Protection**: All resource IDs (UUIDs) validated against workspace/tenant ownership.
- **Mass-Assignment Protection**: Use strict Zod schema parsing for all incoming DTOs; never pass raw request bodies directly to Prisma update calls.

---

## 27. API Architecture Requirements

RESTful API Route Registry (`/api/v1/admin`):

- `GET /api/v1/admin/dashboard` - Operational metrics & alerts feed
- `GET /api/v1/admin/products`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`
- `GET /api/v1/admin/categories`, `POST`, `PUT /:id`, `DELETE /:id`
- `GET /api/v1/admin/collections`, `POST`, `PUT /:id`, `DELETE /:id`
- `GET /api/v1/admin/attributes`, `POST`, `PUT /:id`, `DELETE /:id`
- `GET /api/v1/admin/inventory`, `POST /adjust`, `GET /movements`
- `GET /api/v1/admin/orders`, `GET /:id`, `PATCH /:id/status`
- `GET /api/v1/admin/shipments`, `POST`, `PATCH /:id/status`
- `GET /api/v1/admin/payments`, `GET /:id`
- `GET /api/v1/admin/invoices`, `GET /:id/pdf`
- `GET /api/v1/admin/customers`, `GET /:id`, `PATCH /:id/status`
- `GET /api/v1/admin/coupons`, `POST`, `PUT /:id`
- `GET /api/v1/admin/reviews`, `PATCH /:id/publish`
- `GET /api/v1/admin/returns`, `PATCH /:id/status`
- `GET /api/v1/admin/refunds`, `POST /process`
- `GET /api/v1/admin/admin-users`, `POST`, `PUT /:id`
- `GET /api/v1/admin/roles`, `POST`, `PUT /:id`
- `GET /api/v1/admin/audit-logs` (Read-only)

---

## 28. Transaction & State Machine Requirements

- **Prisma Interactive Transactions (`prisma.$transaction`)**:
  - **Stock Adjustment**: Lock `inventories` row, update `quantity_on_hand`, create `inventory_movements` log.
  - **Order Status Shift**: Mutate `orders.order_status`, append `order_status_history`, release/reserve stock if cancelled/confirmed.
  - **Refund Processing**: Create `refunds` entry, record `payment_transactions`, update `payments.payment_status` & `orders.order_status`.

---

## 29. Error & Validation Standards

- Standardized JSON Error Payload:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid status transition from SHIPPED to PENDING",
      "details": []
    }
  }
  ```
- HTTP Codes: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `500 Internal Error`.

---

## 30. Database Protection Rules

- **Zero Schema Alterations**: Do NOT create new tables, add columns, alter data types, or modify default values.
- **Enum Integrity**: Strictly consume database enums (`user_status`, `product_status`, `order_status`, `shipment_status`, etc.) without adding custom string values.
- **Reporting Protocol**: If any future requirement cannot be supported by the current schema, STOP execution and present a formal schema change request detailing: Model, Field, Reason, Migration Impact.

---

## 31. User Scenarios & Testing *(mandatory SpecKit section)*

### User Story 1 - Catalog & Product Management (Priority: P1)

An administrator manages fashion apparel items, setting prices, organizing categories, configuring color/size variants, and publishing products to the storefront.

**Why this priority**: Core revenue driver; storefront cannot display products without catalog administration.  
**Independent Test**: Can be tested by creating a product with variants and publishing it to verify storefront accessibility.

**Acceptance Scenarios**:
1. **Given** an admin with `products:create` permission, **When** they submit valid product details and variant combinations, **Then** the product, variant, and inventory records are created atomically.
2. **Given** a product in `DRAFT` status, **When** the admin triggers the publish action, **Then** `product_status` transitions to `ACTIVE` and an audit log record is created.

---

### User Story 2 - Order Fulfillment & Shipment Tracking (Priority: P1)

An order fulfillment manager inspects pending customer orders, packs items, creates shipment packages, assigns tracking codes, and updates delivery status.

**Why this priority**: Essential for fulfilling customer purchases and operational tracking.  
**Independent Test**: Can be tested by transitioning a confirmed order to processing, generating a shipment record, and marking it as shipped.

**Acceptance Scenarios**:
1. **Given** an order in `CONFIRMED` state, **When** the manager creates a shipment with tracking number `TRK123456`, **Then** a `shipments` row is created, `shipment_items` are linked, and `order_status` transitions to `PROCESSING` or `SHIPPED`.
2. **Given** a shipped order, **When** an invalid transition to `PENDING` is attempted, **Then** the API rejects the request with HTTP `400` invalid status transition error.

---

### User Story 3 - Transaction-Safe Inventory Adjustments (Priority: P2)

An inventory manager conducts stock counts, adjusts variant quantities for damaged goods or stock-in shipments, and reviews movement logs.

**Why this priority**: Prevents overselling and stock discrepancies across warehouse locations.  
**Independent Test**: Can be tested by performing a stock adjustment and verifying `inventories.quantity_on_hand` and `inventory_movements` log output.

**Acceptance Scenarios**:
1. **Given** a variant with `quantity_on_hand = 50` and `quantity_reserved = 5`, **When** the manager records an adjustment of `-5` for `DAMAGE`, **Then** `quantity_on_hand` becomes `45`, `available_quantity` becomes `40`, and an `inventory_movements` row is recorded with reason `DAMAGE`.

---

### User Story 4 - After Sales Returns & Refunds (Priority: P2)

A customer service agent processes an incoming garment return, inspects item condition, approves the return, and issues a partial or full refund.

**Why this priority**: Handles post-purchase customer satisfaction and financial reconciliation.  
**Independent Test**: Can be tested by approving an open return request and processing the associated refund transaction.

**Acceptance Scenarios**:
1. **Given** an approved return request, **When** the agent processes a refund of `$45.00`, **Then** a `refunds` entry is created, a `payment_transactions` record is added, and `orders.order_status` updates to `PARTIALLY_REFUNDED`.

---

### Edge Cases

- **Concurrent Inventory Updates**: What happens when two admins adjust stock for the same SKU simultaneously? *System uses database row locking (`FOR UPDATE`) within interactive transactions.*
- **Unpermitted Transition**: How does the system handle an attempt to refund an order without an active payment record? *Request fails validation with `422 Unprocessable Entity` before initiating gateway calls.*

---

## 32. Requirements & Key Entities *(mandatory SpecKit section)*

### Functional Requirements

- **FR-001**: System MUST enforce RBAC permissions on all `/api/v1/admin/*` API endpoints.
- **FR-002**: System MUST perform all stock adjustments inside atomic transactions creating `inventory_movements`.
- **FR-003**: System MUST enforce state machine validation for `order_status`, `shipment_status`, and `return_status`.
- **FR-004**: System MUST record immutable `audit_logs` for all sensitive administrative updates.
- **FR-005**: System MUST mask sensitive data (`password_hash`, credit card tokens) in API responses.

### Key Entities

- **Product (`products`)**: Catalog item representing a fashion style, linked to `categories`, `collections`, `product_images`, and `product_variants`.
- **Product Variant (`product_variants`)**: Specific size/color SKU with stock counts and pricing details.
- **Inventory (`inventories`)**: Stock balance tracking `quantity_on_hand`, `quantity_reserved`, and `reorder_level`.
- **Order (`orders`)**: Customer purchase record containing `order_items`, shipping address, financial state, and status timeline.
- **Shipment (`shipments`)**: Package fulfillment entity tracking carrier, tracking number, and package status history.
- **Return & Refund (`returns`, `refunds`)**: After-sales records handling item return inspections and monetary refunds.

---

## 33. Success Criteria & Assumptions *(mandatory SpecKit section)*

### Measurable Outcomes

- **SC-001**: Administrators can locate any order by order number or customer email in under 2 seconds.
- **SC-002**: 100% of inventory adjustments produce a corresponding traceable `inventory_movements` record.
- **SC-003**: 100% of unauthorized API requests to `/api/v1/admin/*` are blocked at the backend middleware layer with HTTP `401`/`403`.
- **SC-004**: Zero administrative actions cause database constraint violations or orphan records.

### Assumptions

- The existing PostgreSQL database schema and Prisma models in `backend/` are fully implemented and connected.
- External payment gateway SDKs (Stripe/PayPal) will handle direct card processing while backend APIs process refund receipts.
- All administrative users will access the system via modern web browsers with valid JWT credentials.

---

## 34. Acceptance Criteria & Out-of-Scope Items

### Acceptance Criteria

- [x] Complete feature specification created under `specs/003-admin-panel/spec.md`.
- [x] Specification covers all 33 required sections in full technical detail.
- [x] Every entity, enum, and status transition strictly matches `DATABASE_DESIGN.md` and `AIRAVE_ADMIN_PANEL_PLAN.md`.
- [x] Zero code implementation or database schema modifications executed during this specify phase.

### Out-of-Scope Items

- Writing backend route handlers, controllers, or database migrations.
- Developing frontend UI components or pages.
- Modifying `schema.prisma` or running database migrations.
