# Feature Specification: E-Commerce Database Layer Implementation

**Feature Branch**: `001-ecommerce-database-layer`  
**Created**: 2026-08-18  
**Status**: Draft  
**Input**: Implement finalized e-commerce database design (`DATABASE_DESIGN.md`) using Prisma ORM and PostgreSQL.

---

## Executive Summary & Source of Truth

The canonical source of truth for the database architecture is [`DATABASE_DESIGN.md`](file:///d:/CS-Next/backend/DATABASE_DESIGN.md).
- **Rule 1**: The database design is finalized. Do NOT redesign the database.
- **Rule 2**: Do NOT add new models unless strictly required for implementation.
- **Rule 3**: Do NOT remove existing models defined in `DATABASE_DESIGN.md`.
- **Rule 4**: Do NOT rename models, fields, enums, relationships, or concepts unless required by a Prisma/PostgreSQL technical limitation.
- **Rule 5**: Do NOT alter business rules established in `DATABASE_DESIGN.md`.
- **Rule 6**: All identified improvements must be documented as Recommendations, not implemented directly.

---

## Contradictions Identification & Gap Analysis

Before specification detailing, an audit of the existing codebase (`backend/prisma/schema.prisma`) against `DATABASE_DESIGN.md` was conducted. The following critical contradictions and discrepancies were identified:

### 1. Existing Placeholder Schema vs. Finalized SQL Design
* **Existing Project State**: `backend/prisma/schema.prisma` contains an initial 8-model placeholder schema (`User`, `Category`, `Product`, `ProductColor`, `ProductSize`, `Order`, `OrderItem`, `Review`).
* **Finalized Design (`DATABASE_DESIGN.md`)**: Defines a complete 48-table enterprise fashion e-commerce schema with 16 enums, dynamic attributes, RBAC, multi-variant hierarchy, inventory movements & reservations, guest/user carts, coupons, shipments, invoices, payments/transactions, returns, refunds, and audit logs.
* **Resolution**: The temporary 8-model schema in `schema.prisma` MUST be replaced entirely with the complete 48-model schema derived strictly from `DATABASE_DESIGN.md`.

### 2. Discrepancy in Product Attribute & Variant Modeling
* **Existing Project State**: Hardcoded `ProductColor` and `ProductSize` relations on `Product`.
* **Finalized Design**: Uses dynamic normalized `attributes`, `attribute_values`, `product_attribute_values`, `product_variants`, `variant_attribute_values`, and `variant_images`.
* **Resolution**: Remove hardcoded color/size models; implement the multi-tier variant and attribute model as specified in `DATABASE_DESIGN.md`.

### 3. Discrepancy in User Authentication & RBAC
* **Existing Project State**: Single `role` enum (`CUSTOMER`, `ADMIN`) on `User`, plus `firebaseUid`, `authProvider`.
* **Finalized Design**: Dedicated `users` table with soft delete (`deleted_at`), `status` (`user_status` enum with 5 statuses: `PENDING`, `ACTIVE`, `SUSPENDED`, `BLOCKED`, `DEACTIVATED`), and normalized Many-to-Many RBAC via `roles`, `permissions`, `user_roles`, and `role_permissions`.
* **Resolution**: Adopt the relational RBAC and user status model strictly from `DATABASE_DESIGN.md`.

### 4. Precision & Data Type Contradictions
* **Existing Project State**: Monetary values stored as JavaScript `Float` (`price Float`, `total Float`).
* **Finalized Design**: Monetary values explicitly specified as PostgreSQL `NUMERIC(19,4)`.
* **Resolution**: Map all monetary fields (`base_price`, `price`, `total_amount`, `subtotal`, `tax_amount`, `discount_amount`, `shipping_amount`, `unit_price`, `cost_price`, `compare_at_price`, `amount`) to Prisma `@db.Decimal(19, 4)` to preserve decimal accuracy and eliminate floating-point precision loss.

### 5. PostgreSQL Native Extensions & Types Mapping
* **`citext` Extension**: `users.email` and `orders.customer_email` use case-insensitive text (`CITEXT`). In Prisma, this is specified via `@db.Citext` with PostgreSQL `postgresqlExtensions` feature flag or native Prisma String type with `@db.Citext`.
* **`CHAR(2)` / `CHAR(3)`**: ISO country codes and currency codes mapped to `@db.Char(2)` and `@db.Char(3)`.
* **`INET`**: `audit_logs.ip_address` mapped to `@db.Inet` (or String with `@db.Inet`).
* **`JSONB`**: `payments.metadata`, `payment_transactions.gateway_response`, `audit_logs.old_values/new_values` mapped to Prisma `Json`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Variant Catalog & Inventory Integrity (Priority: P1)

As a customer or system administrator, I want product variants (SKUs, sizes, colors, pricing) and inventory balances to be strictly linked and tracked so that inventory cannot be over-reserved or sold when unavailable.

**Why this priority**: Core value of an e-commerce platform relies on accurate product modeling and stock tracking.

**Independent Test**: Can create a product with multiple attributes and variants, attach stock in `inventories`, reserve items in `inventory_reservations`, and record balance adjustments in `inventory_movements`.

**Acceptance Scenarios**:
1. **Given** a product "AIRAVE Premium Cotton T-Shirt", **When** variants for "Black/M" and "Black/L" are created with unique SKUs, **Then** each variant links to its distinct `inventories` record with `quantity_on_hand` and `quantity_reserved`.
2. **Given** an active inventory reservation, **When** stock is checked, **Then** available stock is calculated strictly as `quantity_on_hand - quantity_reserved`, enforcing `quantity_reserved <= quantity_on_hand`.

---

### User Story 2 - Customer Cart & Checkout Snapshotting (Priority: P2)

As a buyer (guest or logged-in user), I want to maintain items in my cart and convert them into an immutable order snapshot upon checkout.

**Why this priority**: Essential customer purchase path requiring atomic transition from cart state to order/item snapshots.

**Independent Test**: Can populate a cart for a user or guest token, convert it to an `Order` with `OrderItems` and `OrderAddresses`, preserving prices and product titles even if original products are edited later.

**Acceptance Scenarios**:
1. **Given** an active cart with cart items, **When** checkout completes, **Then** order status becomes `CONFIRMED`, an `order_number` is generated, and `order_items` stores historical snapshots (`sku`, `product_name`, `variant_name`, `unit_price`, `total_amount`).
2. **Given** a user address, **When** selected during checkout, **Then** an `order_addresses` record creates an immutable copy of the shipping/billing address attached to the order ID.

---

### User Story 3 - Payment Tracking, Invoicing & Order Lifecycle (Priority: P3)

As a financial manager or system admin, I want all payment transactions, shipments, invoices, returns, and refunds linked to the corresponding order.

**Why this priority**: Necessary for enterprise accounting, order fulfillment, post-sale support, and auditability.

**Independent Test**: Can record a payment authorization/capture in `payments` and `payment_transactions`, generate an `invoice`, track shipments via `shipments`/`shipment_items`, and log status changes in `order_status_history`.

**Acceptance Scenarios**:
1. **Given** a paid order, **When** payment is captured, **Then** `payments` status transitions to `CAPTURED`, a `payment_transactions` record of type `SALE` or `CAPTURE` is logged, and an `invoices` record is generated.
2. **Given** an order status change, **When** order status updates from `PENDING` to `PROCESSING`, **Then** a row is automatically inserted into `order_status_history` recording `old_status`, `new_status`, `changed_by`, and timestamp.

---

### Edge Cases

- **Cart Ownership**: Handling guest carts when `user_id` is null versus logged-in carts where `guest_token` is null, ensuring `user_id IS NOT NULL OR guest_token IS NOT NULL`.
- **Soft Deletes**: Queries on `users`, `products`, `product_variants`, `collections`, `categories`, `user_addresses`, `orders`, `product_reviews` must respect `deleted_at IS NULL` filters.
- **Cascade Deletions**: Deleting a product cascades to `product_images`, `product_videos`, `product_variants`, `product_attribute_values`, `wishlist_items`, `coupon_products`, and `product_reviews`; deleting a category restricts if referenced in `product_categories`.
- **Inventory Concurrency**: Utilizing the `version` column in `inventories` for optimistic locking during concurrent order placements.

---

## Requirements *(mandatory)*

### Functional Requirements: Coverage of 22 Core Areas

1. **FR-001 (All Database Models)**: System MUST model all 48 tables from `DATABASE_DESIGN.md`: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_addresses`, `collections`, `categories`, `collection_categories`, `products`, `product_categories`, `product_collections`, `product_images`, `product_videos`, `attributes`, `attribute_values`, `product_attribute_values`, `product_variants`, `variant_attribute_values`, `variant_images`, `price_history`, `inventories`, `inventory_movements`, `inventory_reservations`, `wishlists`, `wishlist_items`, `carts`, `cart_items`, `orders`, `order_addresses`, `order_items`, `order_status_history`, `shipments`, `shipment_items`, `shipment_status_history`, `payments`, `payment_transactions`, `invoices`, `product_reviews`, `review_images`, `coupons`, `coupon_products`, `coupon_categories`, `coupon_usages`, `returns`, `return_items`, `refunds`, and `audit_logs`.
2. **FR-002 (Fields & Data Types)**: System MUST define exact column types using native Prisma mappings: UUIDs (`@default(uuid())` / `@db.Uuid`), Decimal `NUMERIC(19,4)` (`@db.Decimal(19, 4)`), text (`TEXT` / `@db.Text`), bounded varchar (`@db.VarChar(N)`), fixed char (`@db.Char(N)`), booleans (`Boolean`), integers (`Int`), big integers (`BigInt`), timestamps (`DateTime` with `@db.Timestamptz`), JSON (`Json`), and Citext (`@db.Citext`).
3. **FR-003 (Required & Optional Fields)**: System MUST strictly match nullability rules (NOT NULL vs NULL) for all table columns defined in `DATABASE_DESIGN.md`.
4. **FR-004 (Primary Keys)**: System MUST define UUID primary keys (`id String @id @default(uuid()) @db.Uuid`) for entity tables and composite primary keys (`@@id([...])`) for junction tables (`user_roles`, `role_permissions`, `collection_categories`, `product_categories`, `product_collections`, `variant_attribute_values`, `variant_images`, `wishlist_items`, `shipment_items`, `coupon_products`, `coupon_categories`).
5. **FR-005 (Foreign Keys)**: System MUST establish foreign key relations across all 48 models matching explicit database constraints.
6. **FR-006 (One-to-One Relationships)**: System MUST model 1:1 relations including `product_variants` <-> `inventories` (`variant_id` unique), `orders` <-> `invoices` (`order_id` unique), and 1:1 user cart uniqueness (`user_id` unique where status = 'ACTIVE').
7. **FR-007 (One-to-Many Relationships)**: System MUST model 1:N relations including `users` -> `user_addresses`, `categories` (parent/children recursive), `products` -> `product_images`, `products` -> `product_variants`, `product_variants` -> `price_history`, `orders` -> `order_items`, `orders` -> `order_addresses`, `orders` -> `shipments`, `orders` -> `payments`, `payments` -> `payment_transactions`, `returns` -> `return_items`, and `product_reviews` -> `review_images`.
8. **FR-008 (Many-to-Many Relationships)**: System MUST model N:M relations via dedicated junction models: `user_roles`, `role_permissions`, `collection_categories`, `product_categories`, `product_collections`, `product_attribute_values`, `variant_attribute_values`, `variant_images`, `wishlist_items`, `coupon_products`, `coupon_categories`, and `shipment_items`.
9. **FR-009 (Enums)**: System MUST define all 16 enums: `UserStatus`, `ProductStatus`, `ProductVisibility`, `CategoryStatus`, `CartStatus`, `OrderStatus`, `PaymentStatus`, `PaymentTransactionType`, `InvoiceStatus`, `ShipmentStatus`, `InventoryMovementType`, `AddressType`, `DiscountType`, `ReturnStatus`, `ReturnReason`, and `RefundStatus`.
10. **FR-010 (Unique Constraints)**: System MUST enforce explicit unique indices/constraints (`users.email`, `roles.name`, `permissions.name`, `collections.slug`, `categories.slug`, `products.slug`, `attributes.slug`, `attribute_values(attribute_id, slug)`, `product_variants.sku`, `carts.guest_token`, `orders.order_number`, `order_addresses(order_id, type)`, `cart_items(cart_id, variant_id)`, `invoices.invoice_number`, `coupons.code`, `coupon_usages(coupon_id, user_id, order_id)`, `payments(provider, provider_payment_id)`, `payment_transactions.provider_transaction_id`, `refunds.provider_refund_id`, `product_reviews(user_id, product_id)`).
11. **FR-011 (Database Indexes)**: System MUST map all index definitions (`@@index`) for performance optimization on search columns (`status`, `user_id`, `product_id`, `variant_id`, `order_id`, `created_at`, `tracking_number`, `sku`, `barcode`).
12. **FR-012 (Default Values)**: System MUST configure default column values: UUID generation (`gen_random_uuid()`), timestamps (`now()`), boolean defaults (`is_default: false`, `is_active: true`, `is_primary: false`), zero numbers (`0`), currency defaults (`'INR'`), country defaults (`'IN'`), status defaults (`user_status: 'PENDING'`, `product_status: 'DRAFT'`, `product_visibility: 'PUBLIC'`, `cart_status: 'ACTIVE'`, `order_status: 'PENDING'`, `payment_status: 'PENDING'`, `invoice_status: 'DRAFT'`, `shipment_status: 'PENDING'`, `return_status: 'REQUESTED'`, `refund_status: 'PENDING'`), and empty JSON (`{}`).
13. **FR-013 (Cascade/Restrict Behavior)**: System MUST configure referential action rules on foreign keys (`onDelete: Cascade` for child records like images/addresses/items; `onDelete: Restrict` for critical referenced entities like order items -> variants, product categories -> category, coupon usages -> coupon; `onDelete: SetNull` for non-critical historical references like orders -> user, reviews -> variant/user/order_item).
14. **FR-014 (Timestamp Handling)**: System MUST enforce `created_at` (`@default(now())`) and `updated_at` (`@updatedAt`) across all stateful entities.
15. **FR-015 (Soft Deletion)**: System MUST support soft deletion via `deleted_at DateTime?` on `users`, `user_addresses`, `collections`, `categories`, `products`, `product_variants`, `orders`, and `product_reviews`.
16. **FR-016 (Product & Product Variant Relationships)**: System MUST link `products` (1) to `product_variants` (N), with variants referencing `attributes` via `variant_attribute_values`, variant images via `variant_images`, and historical prices via `price_history`.
17. **FR-017 (Inventory Relationships)**: System MUST link `product_variants` (1) to `inventories` (1), `inventory_movements` (N), and `inventory_reservations` (N).
18. **FR-018 (Cart Relationships)**: System MUST link `carts` to `users` (optional) / guest token, and `carts` (1) to `cart_items` (N), with `cart_items` linking to `product_variants`.
19. **FR-019 (Order Relationships)**: System MUST link `orders` to `users` (optional), `order_items` (N), `order_addresses` (N - shipping/billing snapshot), `order_status_history` (N), `shipments` (N), `payments` (N), `invoices` (1), `returns` (N), `refunds` (N), and `coupon_usages` (N).
20. **FR-020 (Payment Relationships)**: System MUST link `payments` to `orders` (1:N), `payments` to `payment_transactions` (1:N), and `payments` to `refunds` (1:N).
21. **FR-021 (User & Address Relationships)**: System MUST link `users` to `user_addresses` (1:N), `wishlists` (1:N), `carts` (1:N), `orders` (1:N), `product_reviews` (1:N), `user_roles` (1:N), and `audit_logs` (1:N).
22. **FR-022 (Auxiliary Relationships)**: System MUST implement `coupons` <-> `coupon_products` / `coupon_categories` / `coupon_usages`, `returns` <-> `return_items`, `shipments` <-> `shipment_items` / `shipment_status_history`, and `audit_logs`.

---

## Detailed Model & Entity Specifications

Below is the complete dictionary of entities and enums to be reflected in Prisma ORM matching [`DATABASE_DESIGN.md`](file:///d:/CS-Next/backend/DATABASE_DESIGN.md):

### Enums (16)
1. `UserStatus`: `PENDING`, `ACTIVE`, `SUSPENDED`, `BLOCKED`, `DEACTIVATED`
2. `ProductStatus`: `DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `ARCHIVED`
3. `ProductVisibility`: `PUBLIC`, `PRIVATE`, `HIDDEN`
4. `CategoryStatus`: `ACTIVE`, `INACTIVE`
5. `CartStatus`: `ACTIVE`, `CONVERTED`, `ABANDONED`, `EXPIRED`
6. `OrderStatus`: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PARTIALLY_CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `FAILED`
7. `PaymentStatus`: `PENDING`, `AUTHORIZED`, `CAPTURED`, `PARTIALLY_REFUNDED`, `REFUNDED`, `FAILED`, `CANCELLED`
8. `PaymentTransactionType`: `AUTHORIZATION`, `CAPTURE`, `SALE`, `REFUND`, `VOID`, `CHARGEBACK`
9. `InvoiceStatus`: `DRAFT`, `ISSUED`, `PAID`, `CANCELLED`, `REFUNDED`
10. `ShipmentStatus`: `PENDING`, `PROCESSING`, `PACKED`, `SHIPPED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`
11. `InventoryMovementType`: `INITIAL`, `PURCHASE`, `SALE`, `RESERVATION`, `RELEASE`, `RETURN`, `ADJUSTMENT`, `DAMAGE`, `LOSS`
12. `AddressType`: `BILLING`, `SHIPPING`
13. `DiscountType`: `FIXED`, `PERCENTAGE`
14. `ReturnStatus`: `REQUESTED`, `APPROVED`, `REJECTED`, `PICKED_UP`, `RECEIVED`, `INSPECTED`, `REFUNDED`, `CANCELLED`
15. `ReturnReason`: `WRONG_SIZE`, `WRONG_PRODUCT`, `DAMAGED`, `DEFECTIVE`, `NOT_AS_EXPECTED`, `CHANGED_MIND`, `OTHER`
16. `RefundStatus`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`

### Models (48)

#### Core & RBAC Layer
- **`User`** (`users`): Primary customer/staff entity (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `status`, `email_verified_at`, `phone_verified_at`, `last_login_at`, `deleted_at`, `created_at`, `updated_at`).
- **`Role`** (`roles`): Permission container (`id`, `name`, `description`, `created_at`, `updated_at`).
- **`Permission`** (`permissions`): Granular access right (`id`, `name`, `description`, `created_at`, `updated_at`).
- **`UserRole`** (`user_roles`): Junction connecting `user_id` and `role_id` (`@@id([user_id, role_id])`, `onDelete: Cascade`).
- **`RolePermission`** (`role_permissions`): Junction connecting `role_id` and `permission_id` (`@@id([role_id, permission_id])`, `onDelete: Cascade`).
- **`UserAddress`** (`user_addresses`): Customer saved addresses (`id`, `user_id`, `type`, `first_name`, `last_name`, `address_line_1`, `address_line_2`, `landmark`, `city`, `state`, `postal_code`, `country_code`, `phone`, `is_default`, `deleted_at`, timestamps).

#### Catalog Layer
- **`Collection`** (`collections`): Marketing groups like Summer/Festive (`id`, `name`, `slug`, `description`, `image_url`, `status`, `sort_order`, `meta_title`, `meta_description`, `deleted_at`, timestamps).
- **`Category`** (`categories`): Product taxonomy with self-referencing `parent_id` (`id`, `parent_id`, `name`, `slug`, `description`, `image_url`, `status`, `sort_order`, `meta_title`, `meta_description`, `deleted_at`, timestamps).
- **`CollectionCategory`** (`collection_categories`): Junction between collections and categories (`@@id([collection_id, category_id])`).
- **`Product`** (`products`): Base product entity (`id`, `name`, `slug`, `description`, `short_description`, `product_type`, `status`, `visibility`, `base_price`, `compare_at_price`, `currency`, `tax_code`, `care_instructions`, `meta_title`, `meta_description`, `deleted_at`, timestamps).
- **`ProductCategory`** (`product_categories`): Product-category association with `is_primary` flag (`@@id([product_id, category_id])`, `onDelete: Restrict` for category).
- **`ProductCollection`** (`product_collections`): Product-collection association with `sort_order` (`@@id([product_id, collection_id])`).
- **`ProductImage`** (`product_images`): Gallery images (`id`, `product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`).
- **`ProductVideo`** (`product_videos`): Product videos (`id`, `product_id`, `video_url`, `thumbnail_url`, `title`, `sort_order`, `created_at`).

#### Variants & Attributes Layer
- **`Attribute`** (`attributes`): E.g., Color, Size, Fabric (`id`, `name`, `slug`, `description`, `is_variant_attribute`, `is_filterable`, `is_visible`, `sort_order`, timestamps).
- **`AttributeValue`** (`attribute_values`): E.g., Red, Blue, XL (`id`, `attribute_id`, `value`, `slug`, `color_hex`, `image_url`, `sort_order`, `created_at`).
- **`ProductAttributeValue`** (`product_attribute_values`): Static product specs (`@@id([product_id, attribute_value_id])`).
- **`ProductVariant`** (`product_variants`): Purchasable SKU (`id`, `product_id`, `sku`, `barcode`, `variant_name`, `price`, `compare_at_price`, `cost_price`, `weight_grams`, `is_default`, `is_active`, `deleted_at`, timestamps).
- **`VariantAttributeValue`** (`variant_attribute_values`): SKU attribute mapping (`@@id([variant_id, attribute_value_id])`).
- **`VariantImage`** (`variant_images`): Variant-image junction (`@@id([variant_id, image_id])`).
- **`PriceHistory`** (`price_history`): Audit trail of variant price changes (`id`, `variant_id`, `price`, `compare_at_price`, `valid_from`, `valid_until`, `changed_by`, `created_at`).

#### Inventory Layer
- **`Inventory`** (`inventories`): Variant stock balances (`id`, `variant_id` unique, `quantity_on_hand`, `quantity_reserved`, `reorder_level`, `version` optimistic locking, timestamps).
- **`InventoryMovement`** (`inventory_movements`): Audit log of stock adjustments (`id`, `variant_id`, `movement_type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`).
- **`InventoryReservation`** (`inventory_reservations`): Temporary cart/checkout reservations (`id`, `variant_id`, `cart_id`, `order_id`, `quantity`, `expires_at`, `released_at`, `created_at`).

#### Wishlist & Cart Layer
- **`Wishlist`** (`wishlists`): User wishlist (`id`, `user_id`, `name`, timestamps).
- **`WishlistItem`** (`wishlist_items`): Products in wishlist (`@@id([wishlist_id, product_id])`).
- **`Cart`** (`carts`): Guest or user active session (`id`, `user_id`, `guest_token` unique, `status`, `expires_at`, timestamps).
- **`CartItem`** (`cart_items`): Items in cart (`id`, `cart_id`, `variant_id`, `quantity`, timestamps; `unique(cart_id, variant_id)`).

#### Order, Shipment & Payment Layer
- **`Order`** (`orders`): Purchase order (`id`, `order_number` unique, `user_id`, `status`, `currency`, `subtotal`, `discount_amount`, `shipping_amount`, `tax_amount`, `total_amount`, `customer_email`, `customer_phone`, `notes`, `placed_at`, `deleted_at`, timestamps).
- **`OrderAddress`** (`order_addresses`): Immutable checkout address snapshot (`id`, `order_id`, `type`, `first_name`, `last_name`, `address_line_1`, `address_line_2`, `landmark`, `city`, `state`, `postal_code`, `country_code`, `phone`, `created_at`; `unique(order_id, type)`).
- **`OrderItem`** (`order_items`): Immutable checkout product snapshot (`id`, `order_id`, `variant_id`, `sku`, `product_name`, `variant_name`, `quantity`, `unit_price`, `discount_amount`, `tax_amount`, `total_amount`, `created_at`).
- **`OrderStatusHistory`** (`order_status_history`): Audit trail of order status updates (`id`, `order_id`, `old_status`, `new_status`, `changed_by`, `reason`, `created_at`).
- **`Shipment`** (`shipments`): Package dispatch record (`id`, `order_id`, `status`, `carrier`, `tracking_number`, `tracking_url`, `shipping_method`, `estimated_delivery_at`, `shipped_at`, `delivered_at`, timestamps).
- **`ShipmentItem`** (`shipment_items`): Order items in shipment (`@@id([shipment_id, order_item_id])`, `quantity`).
- **`ShipmentStatusHistory`** (`shipment_status_history`): Tracking status log (`id`, `shipment_id`, `old_status`, `new_status`, `notes`, `created_at`).
- **`Payment`** (`payments`): Gateway transaction header (`id`, `order_id`, `provider`, `provider_payment_id`, `status`, `currency`, `amount`, `metadata` JSON, `failure_code`, `failure_message`, `authorized_at`, `captured_at`, `refunded_at`, timestamps).
- **`PaymentTransaction`** (`payment_transactions`): Transaction log (`id`, `payment_id`, `transaction_type`, `provider_transaction_id` unique, `amount`, `currency`, `status`, `gateway_response` JSON, `created_at`).
- **`Invoice`** (`invoices`): Billing invoice (`id`, `order_id` unique, `invoice_number` unique, `status`, `currency`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `issued_at`, `paid_at`, `pdf_url`, timestamps).

#### Reviews, Coupons, Returns & Audit Layer
- **`ProductReview`** (`product_reviews`): Ratings and feedback (`id`, `product_id`, `variant_id`, `user_id`, `order_item_id`, `rating`, `title`, `body`, `is_verified_purchase`, `is_published`, `deleted_at`, timestamps; `unique(user_id, product_id)`).
- **`ReviewImage`** (`review_images`): Review attachments (`id`, `review_id`, `image_url`, `sort_order`, `created_at`).
- **`Coupon`** (`coupons`): Promotional code (`id`, `code` unique, `description`, `discount_type`, `discount_value`, `minimum_order_amount`, `maximum_discount_amount`, `usage_limit`, `usage_limit_per_user`, `used_count`, `starts_at`, `expires_at`, `is_active`, timestamps).
- **`CouponProduct`** (`coupon_products`): Applicable products (`@@id([coupon_id, product_id])`).
- **`CouponCategory`** (`coupon_categories`): Applicable categories (`@@id([coupon_id, category_id])`).
- **`CouponUsage`** (`coupon_usages`): Coupon redemption log (`id`, `coupon_id`, `user_id`, `order_id`, `discount_amount`, `created_at`; `unique(coupon_id, user_id, order_id)`).
- **`Return`** (`returns`): Return request (`id`, `order_id`, `user_id`, `status`, `reason`, `customer_note`, `admin_note`, `requested_at`, `approved_at`, `completed_at`, timestamps).
- **`ReturnItem`** (`return_items`): Returned line items (`id`, `return_id`, `order_item_id`, `quantity`, `reason`, `condition_note`, `created_at`).
- **`Refund`** (`refunds`): Refund dispatch record (`id`, `order_id`, `payment_id`, `return_id`, `amount`, `currency`, `status`, `provider_refund_id` unique, `reason`, `processed_at`, timestamps).
- **`AuditLog`** (`audit_logs`): System change audit log (`id`, `user_id`, `entity_type`, `entity_id`, `action`, `old_values` JSON, `new_values` JSON, `ip_address`, `user_agent`, `created_at`).

---

## Architectural & Technical Recommendations

As required by prompt instructions, any potential improvements or enhancements identified during analysis are documented here as recommendations, rather than altering `DATABASE_DESIGN.md`:

1. **Recommendation 1: Seed Initial System Data via Prisma Seed Script**
   * *Observation*: `DATABASE_DESIGN.md` contains default `INSERT` statements for initial `roles` (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`) and standard clothing `attributes` (`Color`, `Size`, `Fabric`, `Fit`, etc.).
   * *Recommendation*: Create a `prisma/seed.ts` script to run these insertions automatically upon `npx prisma db seed`.

2. **Recommendation 2: Migration Script Customization for PostgreSQL Partial Indexes & CHECK Constraints**
   * *Observation*: `DATABASE_DESIGN.md` defines CHECK constraints (`chk_inventory_reserved`, `chk_product_base_price`, etc.) and filtered partial indexes (`WHERE deleted_at IS NULL`).
   * *Recommendation*: When executing `npx prisma migrate dev --name init --create-only`, include custom SQL in the generated migration file to ensure native PostgreSQL `CHECK` constraints and partial index clauses are preserved exactly.

3. **Recommendation 3: Optimistic Locking Helper via Prisma Middleware / Client Extension**
   * *Observation*: `inventories` table contains a `version` BIGINT column for optimistic concurrency control.
   * *Recommendation*: Implement a Prisma Client extension in application logic to automatically increment `version` and throw concurrency exceptions on version mismatches during inventory stock updates.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 48 database models and 16 enums from `DATABASE_DESIGN.md` are accurately defined in Prisma schema without omitting any tables, columns, or relations.
- **SC-002**: Zero floating-point representation errors for financial calculations by enforcing `@db.Decimal(19, 4)` across all monetary fields.
- **SC-003**: Schema compilation succeeds cleanly via `npx prisma validate` with 0 syntax or relational errors.
- **SC-004**: Database migrations execute cleanly via Prisma CLI against PostgreSQL 16+ creating exact tables, foreign key constraints, default values, and index definitions matching `DATABASE_DESIGN.md`.

---

## Assumptions

- PostgreSQL version is 16 or higher with support for `UUID`, `CITEXT`, and `JSONB` extensions.
- Prisma ORM version 5.x+ is installed in `backend/package.json`.
- The Node.js application will consume Prisma Client generated from `backend/prisma/schema.prisma`.
- Application API endpoints, controllers, and frontend interface implementation will be performed in subsequent project phases.
