# Data Model & Prisma Schema Mapping: AIRAVÉ Admin Panel

**Feature**: Admin Panel Specification & Plan  
**Branch**: `003-admin-panel`  
**Date**: 2026-08-19

---

## 1. Domain Entities & Database Model Mapping

This document details the exact mapping between Admin Panel operational modules and established PostgreSQL tables defined in `backend/DATABASE_DESIGN.md`.

### 1. User & RBAC Domain
- **`users`**: Stores admin operators and customers. Key fields: `id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `status` (`user_status` enum), `last_login_at`, `created_at`.
- **`roles`**: Administrative role definitions (`id`, `name`, `description`).
- **`permissions`**: Granular capability keys (`id`, `name`, `module`, `action`).
- **`user_roles`**: Join table mapping `user_id` to `role_id`.
- **`role_permissions`**: Join table mapping `role_id` to `permission_id`.
- **`audit_logs`**: Immutable security event log (`id`, `user_id`, `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`).

### 2. Catalog & Product Domain
- **`products`**: Primary catalog entity (`id`, `title`, `slug`, `description`, `short_description`, `status` [`product_status`], `visibility` [`product_visibility`], `base_price`, `compare_at_price`, `cost_price`, `sku`, `barcode`).
- **`categories`**: Hierarchy tree (`id`, `name`, `slug`, `parent_id`, `status` [`category_status`], `display_order`).
- **`product_categories`**: Join table (`product_id`, `category_id`, `is_primary`).
- **`collections`**: Marketing groupings (`id`, `title`, `slug`, `is_featured`, `published_at`, `expires_at`).
- **`product_collections`**: Join table with ordering (`product_id`, `collection_id`, `sort_order`).
- **`attributes`**: Variant parameters (`id`, `name`, `type`, `is_filterable`, `is_visible`).
- **`attribute_values`**: Selectable options (`id`, `attribute_id`, `value`, `hex_color`, `sort_order`).
- **`product_variants`**: Specific sellable SKU (`id`, `product_id`, `sku`, `barcode`, `price`, `compare_at_price`, `cost_price`, `weight`, `is_default`, `is_active`).
- **`product_variant_attribute_values`**: Join table (`variant_id`, `attribute_value_id`).
- **`product_images`**: Gallery images (`id`, `product_id`, `url`, `alt_text`, `display_order`).

### 3. Inventory Domain
- **`inventories`**: Stock balances (`id`, `variant_id`, `quantity_on_hand`, `quantity_reserved`, `reorder_level`).
  - *Calculated Virtual Property*: `available_quantity = quantity_on_hand - quantity_reserved`.
- **`inventory_movements`**: Transaction log (`id`, `inventory_id`, `user_id`, `movement_type` [`inventory_movement_type`], `quantity_change`, `notes`, `created_at`).
- **`inventory_reservations`**: Active holds (`id`, `inventory_id`, `order_id`, `quantity`, `expires_at`).

### 4. Sales & Fulfillment Domain
- **`orders`**: Customer purchases (`id`, `order_number`, `user_id`, `order_status` [`order_status`], `payment_status` [`payment_status`], `shipment_status` [`shipment_status`], `subtotal`, `shipping_fee`, `discount_total`, `tax_total`, `total_amount`).
- **`order_items`**: Immutable line items snapshot (`id`, `order_id`, `variant_id`, `title`, `sku`, `price`, `quantity`).
- **`order_status_history`**: State transition log (`id`, `order_id`, `previous_status`, `new_status`, `changed_by_user_id`, `reason_notes`).
- **`addresses`**: Customer billing/shipping locations (`id`, `user_id`, `type` [`address_type`], `street`, `city`, `state`, `zip`).
- **`shipments`**: Fulfillment packages (`id`, `order_id`, `shipment_number`, `carrier`, `tracking_number`, `tracking_url`, `shipment_status` [`shipment_status`], `shipped_at`, `delivered_at`).
- **`shipment_items`**: Items in package (`id`, `shipment_id`, `order_item_id`, `quantity`).
- **`shipment_status_history`**: Shipment log (`id`, `shipment_id`, `previous_status`, `new_status`, `notes`).
- **`payments`**: Payment transaction header (`id`, `order_id`, `provider`, `provider_payment_id`, `payment_status` [`payment_status`], `amount`, `currency`).
- **`payment_transactions`**: Detailed gateway attempts (`id`, `payment_id`, `transaction_type` [`payment_transaction_type`], `amount`, `success`, `response_payload`).
- **`invoices`**: Billing documents (`id`, `order_id`, `invoice_number`, `invoice_status` [`invoice_status`], `grand_total`, `issued_at`).

### 5. Marketing, Engagement & After Sales Domain
- **`coupons`**: Promotional vouchers (`id`, `code`, `discount_type` [`discount_type`], `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `is_active`, `start_date`, `end_date`).
- **`coupon_products`**: Product restrictions (`coupon_id`, `product_id`).
- **`coupon_categories`**: Category restrictions (`coupon_id`, `category_id`).
- **`coupon_usages`**: Usage records (`coupon_id`, `user_id`, `order_id`).
- **`reviews`**: Product ratings (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `verified_purchase`, `is_published`).
- **`review_images`**: User review photos (`id`, `review_id`, `url`).
- **`returns`**: Return requests (`id`, `order_id`, `user_id`, `return_number`, `return_status` [`return_status`], `return_reason` [`return_reason`], `customer_notes`, `admin_notes`).
- **`return_items`**: Returned items (`id`, `return_id`, `order_item_id`, `quantity`).
- **`refunds`**: Monetary refunds (`id`, `order_id`, `return_id`, `payment_id`, `refund_number`, `amount`, `refund_status` [`refund_status`], `provider_refund_id`).

---

## 2. Enums Reference

All enums strictly follow `backend/DATABASE_DESIGN.md`:
- `user_status`: `PENDING`, `ACTIVE`, `SUSPENDED`, `BLOCKED`, `DEACTIVATED`
- `product_status`: `DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `ARCHIVED`
- `product_visibility`: `PUBLIC`, `PRIVATE`, `HIDDEN`
- `category_status`: `ACTIVE`, `INACTIVE`
- `order_status`: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PARTIALLY_CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `FAILED`
- `payment_status`: `PENDING`, `AUTHORIZED`, `CAPTURED`, `PARTIALLY_REFUNDED`, `REFUNDED`, `FAILED`, `CANCELLED`
- `payment_transaction_type`: `AUTHORIZATION`, `CAPTURE`, `SALE`, `REFUND`, `VOID`, `CHARGEBACK`
- `invoice_status`: `DRAFT`, `ISSUED`, `PAID`, `CANCELLED`, `REFUNDED`
- `shipment_status`: `PENDING`, `PROCESSING`, `PACKED`, `SHIPPED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`
- `inventory_movement_type`: `INITIAL`, `PURCHASE`, `SALE`, `RESERVATION`, `RELEASE`, `RETURN`, `ADJUSTMENT`, `DAMAGE`, `LOSS`
- `discount_type`: `FIXED`, `PERCENTAGE`
- `return_status`: `REQUESTED`, `APPROVED`, `REJECTED`, `PICKED_UP`, `RECEIVED`, `INSPECTED`, `REFUNDED`, `CANCELLED`
- `return_reason`: `WRONG_SIZE`, `WRONG_PRODUCT`, `DAMAGED`, `DEFECTIVE`, `NOT_AS_EXPECTED`, `CHANGED_MIND`, `OTHER`
- `refund_status`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`
