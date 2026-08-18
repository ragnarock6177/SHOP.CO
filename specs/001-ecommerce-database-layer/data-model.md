# Data Model Specification: E-Commerce Database Layer

This document outlines the complete relational data model to be implemented in `backend/prisma/schema.prisma` derived from [`DATABASE_DESIGN.md`](file:///d:/CS-Next/backend/DATABASE_DESIGN.md).

---

## 1. Enums (16)

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

---

## 2. Models & Entities (48)

### Core User & RBAC Module (6 Models)
- **User** (`users`): `id` (UUID, PK), `firebase_uid` (String?, Unique, for Firebase Auth), `email` (Citext, Unique), `password_hash` (String?), `first_name` (String?), `last_name` (String?), `phone` (String?), `profile_image` (String?), `status` (`UserStatus`), `email_verified_at` (DateTime?), `phone_verified_at` (DateTime?), `last_login_at` (DateTime?), `deleted_at` (DateTime?), `created_at`, `updated_at`.
- **Role** (`roles`): `id` (UUID, PK), `name` (String, Unique), `description` (String?), `created_at`, `updated_at`.
- **Permission** (`permissions`): `id` (UUID, PK), `name` (String, Unique), `description` (String?), `created_at`, `updated_at`.
- **UserRole** (`user_roles`): `user_id`, `role_id` (`@@id([user_id, role_id])`, `onDelete: Cascade`).
- **RolePermission** (`role_permissions`): `role_id`, `permission_id` (`@@id([role_id, permission_id])`, `onDelete: Cascade`).
- **UserAddress** (`user_addresses`): `id` (UUID, PK), `user_id` (FK -> User), `type` (`AddressType`), `first_name`, `last_name`?, `address_line_1`, `address_line_2`?, `landmark`?, `city`, `state`, `postal_code`, `country_code` (`Char(2)`), `phone`?, `is_default` (Boolean), `deleted_at`?, timestamps.

### Catalog Module (8 Models)
- **Collection** (`collections`): `id` (UUID, PK), `name`, `slug` (Unique), `description`?, `image_url`?, `status` (`CategoryStatus`), `sort_order` (Int), `meta_title`?, `meta_description`?, `deleted_at`?, timestamps.
- **Category** (`categories`): `id` (UUID, PK), `parent_id` (FK -> Category, self-relation), `name`, `slug` (Unique), `description`?, `image_url`?, `status` (`CategoryStatus`), `sort_order` (Int), `meta_title`?, `meta_description`?, `deleted_at`?, timestamps.
- **CollectionCategory** (`collection_categories`): `collection_id`, `category_id` (`@@id([collection_id, category_id])`).
- **Product** (`products`): `id` (UUID, PK), `name`, `slug` (Unique), `description`?, `short_description`?, `product_type`?, `status` (`ProductStatus`), `visibility` (`ProductVisibility`), `base_price` (`Decimal(19,4)`?), `compare_at_price` (`Decimal(19,4)`?), `currency` (`Char(3)`), `tax_code`?, `care_instructions`?, `meta_title`?, `meta_description`?, `deleted_at`?, timestamps.
- **ProductCategory** (`product_categories`): `product_id`, `category_id` (`@@id([product_id, category_id])`), `is_primary` (Boolean).
- **ProductCollection** (`product_collections`): `product_id`, `collection_id` (`@@id([product_id, collection_id])`), `sort_order` (Int).
- **ProductImage** (`product_images`): `id` (UUID, PK), `product_id` (FK -> Product), `image_url`, `alt_text`?, `sort_order` (Int), `is_primary` (Boolean), `created_at`.
- **ProductVideo** (`product_videos`): `id` (UUID, PK), `product_id` (FK -> Product), `video_url`, `thumbnail_url`?, `title`?, `sort_order` (Int), `created_at`.

### Attributes & Variants Module (7 Models)
- **Attribute** (`attributes`): `id` (UUID, PK), `name`, `slug` (Unique), `description`?, `is_variant_attribute` (Boolean), `is_filterable` (Boolean), `is_visible` (Boolean), `sort_order` (Int), timestamps.
- **AttributeValue** (`attribute_values`): `id` (UUID, PK), `attribute_id` (FK -> Attribute), `value`, `slug`, `color_hex`?, `image_url`?, `sort_order` (Int), `created_at`, `@@unique([attribute_id, slug])`.
- **ProductAttributeValue** (`product_attribute_values`): `product_id`, `attribute_value_id` (`@@id([product_id, attribute_value_id])`).
- **ProductVariant** (`product_variants`): `id` (UUID, PK), `product_id` (FK -> Product), `sku` (Unique), `barcode`?, `variant_name`?, `price` (`Decimal(19,4)`), `compare_at_price` (`Decimal(19,4)`?), `cost_price` (`Decimal(19,4)`?), `weight_grams` (`Decimal(12,3)`?), `is_default` (Boolean), `is_active` (Boolean), `deleted_at`?, timestamps.
- **VariantAttributeValue** (`variant_attribute_values`): `variant_id`, `attribute_value_id` (`@@id([variant_id, attribute_value_id])`).
- **VariantImage** (`variant_images`): `variant_id`, `image_id` (`@@id([variant_id, image_id])`, `sort_order`).
- **PriceHistory** (`price_history`): `id` (UUID, PK), `variant_id` (FK -> ProductVariant), `price` (`Decimal(19,4)`), `compare_at_price` (`Decimal(19,4)`?), `valid_from`, `valid_until`?, `changed_by` (FK -> User?), `created_at`.

### Inventory Module (3 Models)
- **Inventory** (`inventories`): `id` (UUID, PK), `variant_id` (FK -> ProductVariant, Unique 1:1), `quantity_on_hand` (Int), `quantity_reserved` (Int), `reorder_level` (Int), `version` (BigInt), timestamps.
- **InventoryMovement** (`inventory_movements`): `id` (UUID, PK), `variant_id` (FK -> ProductVariant), `movement_type` (`InventoryMovementType`), `quantity` (Int), `reference_type`?, `reference_id` (UUID?), `notes`?, `created_by` (FK -> User?), `created_at`.
- **InventoryReservation** (`inventory_reservations`): `id` (UUID, PK), `variant_id` (FK -> ProductVariant), `cart_id` (UUID?), `order_id` (UUID?), `quantity` (Int), `expires_at`, `released_at`?, `created_at`.

### Wishlist & Cart Module (4 Models)
- **Wishlist** (`wishlists`): `id` (UUID, PK), `user_id` (FK -> User), `name`, timestamps.
- **WishlistItem** (`wishlist_items`): `wishlist_id`, `product_id` (`@@id([wishlist_id, product_id])`).
- **Cart** (`carts`): `id` (UUID, PK), `user_id` (FK -> User?), `guest_token` (UUID?, Unique), `status` (`CartStatus`), `expires_at`?, timestamps.
- **CartItem** (`cart_items`): `id` (UUID, PK), `cart_id` (FK -> Cart), `variant_id` (FK -> ProductVariant), `quantity` (Int), timestamps, `@@unique([cart_id, variant_id])`.

### Order & Fulfillment Module (6 Models)
- **Order** (`orders`): `id` (UUID, PK), `order_number` (Unique), `user_id` (FK -> User?), `status` (`OrderStatus`), `currency` (`Char(3)`), `subtotal`, `discount_amount`, `shipping_amount`, `tax_amount`, `total_amount` (`Decimal(19,4)`), `customer_email` (`Citext`?), `customer_phone`?, `notes`?, `placed_at`?, `deleted_at`?, timestamps.
- **OrderAddress** (`order_addresses`): `id` (UUID, PK), `order_id` (FK -> Order), `type` (`AddressType`), `first_name`, `last_name`?, `address_line_1`, `address_line_2`?, `landmark`?, `city`, `state`, `postal_code`, `country_code` (`Char(2)`), `phone`?, `created_at`, `@@unique([order_id, type])`.
- **OrderItem** (`order_items`): `id` (UUID, PK), `order_id` (FK -> Order), `variant_id` (FK -> ProductVariant?), `sku`, `product_name`, `variant_name`?, `quantity` (Int), `unit_price`, `discount_amount`, `tax_amount`, `total_amount` (`Decimal(19,4)`), `created_at`.
- **OrderStatusHistory** (`order_status_history`): `id` (UUID, PK), `order_id` (FK -> Order), `old_status` (`OrderStatus`?), `new_status` (`OrderStatus`), `changed_by` (FK -> User?), `reason`?, `created_at`.
- **Shipment** (`shipments`): `id` (UUID, PK), `order_id` (FK -> Order), `status` (`ShipmentStatus`), `carrier`?, `tracking_number`?, `tracking_url`?, `shipping_method`?, `estimated_delivery_at`?, `shipped_at`?, `delivered_at`?, timestamps.
- **ShipmentItem** (`shipment_items`): `shipment_id`, `order_item_id` (`@@id([shipment_id, order_item_id])`), `quantity` (Int).
- **ShipmentStatusHistory** (`shipment_status_history`): `id` (UUID, PK), `shipment_id` (FK -> Shipment), `old_status` (`ShipmentStatus`?), `new_status` (`ShipmentStatus`), `notes`?, `created_at`.

### Payment & Billing Module (3 Models)
- **Payment** (`payments`): `id` (UUID, PK), `order_id` (FK -> Order), `provider`, `provider_payment_id`?, `status` (`PaymentStatus`), `currency` (`Char(3)`), `amount` (`Decimal(19,4)`), `metadata` (`Json`), `failure_code`?, `failure_message`?, `authorized_at`?, `captured_at`?, `refunded_at`?, timestamps, `@@unique([provider, provider_payment_id])`.
- **PaymentTransaction** (`payment_transactions`): `id` (UUID, PK), `payment_id` (FK -> Payment), `transaction_type` (`PaymentTransactionType`), `provider_transaction_id`? (Unique), `amount` (`Decimal(19,4)`), `currency` (`Char(3)`), `status` (`PaymentStatus`), `gateway_response` (`Json`), `created_at`.
- **Invoice** (`invoices`): `id` (UUID, PK), `order_id` (FK -> Order, Unique), `invoice_number` (Unique), `status` (`InvoiceStatus`), `currency` (`Char(3)`), `subtotal`, `tax_amount`, `discount_amount`, `total_amount` (`Decimal(19,4)`), `issued_at`?, `paid_at`?, `pdf_url`?, timestamps.

### Customer Feedback, Marketing & Audit Module (8 Models)
- **ProductReview** (`product_reviews`): `id` (UUID, PK), `product_id` (FK -> Product), `variant_id` (FK -> ProductVariant?), `user_id` (FK -> User), `order_item_id` (FK -> OrderItem?), `rating` (Int), `title`?, `body`?, `is_verified_purchase` (Boolean), `is_published` (Boolean), `deleted_at`?, timestamps, `@@unique([user_id, product_id])`.
- **ReviewImage** (`review_images`): `id` (UUID, PK), `review_id` (FK -> ProductReview), `image_url`, `sort_order` (Int), `created_at`.
- **Coupon** (`coupons`): `id` (UUID, PK), `code` (Unique), `description`?, `discount_type` (`DiscountType`), `discount_value` (`Decimal(19,4)`), `minimum_order_amount`?, `maximum_discount_amount`?, `usage_limit`?, `usage_limit_per_user`?, `used_count` (Int), `starts_at`?, `expires_at`?, `is_active` (Boolean), timestamps.
- **CouponProduct** (`coupon_products`): `coupon_id`, `product_id` (`@@id([coupon_id, product_id])`).
- **CouponCategory** (`coupon_categories`): `coupon_id`, `category_id` (`@@id([coupon_id, category_id])`).
- **CouponUsage** (`coupon_usages`): `id` (UUID, PK), `coupon_id` (FK -> Coupon), `user_id` (FK -> User?), `order_id` (FK -> Order), `discount_amount` (`Decimal(19,4)`), `created_at`, `@@unique([coupon_id, user_id, order_id])`.
- **Return** (`returns`): `id` (UUID, PK), `order_id` (FK -> Order), `user_id` (FK -> User?), `status` (`ReturnStatus`), `reason` (`ReturnReason`), `customer_note`?, `admin_note`?, `requested_at`, `approved_at`?, `completed_at`?, timestamps.
- **ReturnItem** (`return_items`): `id` (UUID, PK), `return_id` (FK -> Return), `order_item_id` (FK -> OrderItem), `quantity` (Int), `reason` (`ReturnReason`), `condition_note`?, `created_at`.
- **Refund** (`refunds`): `id` (UUID, PK), `order_id` (FK -> Order), `payment_id` (FK -> Payment?), `return_id` (FK -> Return?), `amount` (`Decimal(19,4)`), `currency` (`Char(3)`), `status` (`RefundStatus`), `provider_refund_id`? (Unique), `reason`?, `processed_at`?, timestamps.
- **AuditLog** (`audit_logs`): `id` (UUID, PK), `user_id` (FK -> User?), `entity_type`, `entity_id` (UUID), `action`, `old_values` (`Json`?), `new_values` (`Json`?), `ip_address` (`String @db.Inet`?), `user_agent`?, `created_at`.
