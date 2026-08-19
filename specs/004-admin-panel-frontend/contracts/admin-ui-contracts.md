# Admin UI & Backend API Integration Contracts

**Feature**: Admin Panel Frontend (`specs/004-admin-panel-frontend`)  
**Date**: 2026-08-19

## API Integration Mapping Matrix

| Domain Module | Frontend Route | Method | Backend API Endpoint | Required Permission | Request / Query Params | Response Object / Data Key |
|---|---|:---:|---|---|---|---|
| **Dashboard** | `/dashboard` | `GET` | `/api/v1/admin/dashboard` | `dashboard:read` | `fromDate`, `toDate` | `DashboardMetrics` |
| **Products** | `/products` | `GET` | `/api/v1/admin/products` | `products:read` | `page`, `limit`, `search`, `status`, `visibility` | `AdminProduct[]` |
| **Products** | `/products/[id]` | `GET` | `/api/v1/admin/products/:id` | `products:read` | `id` (path) | `AdminProduct` |
| **Products** | `/products/new` | `POST` | `/api/v1/admin/products` | `products:create` | Product JSON payload | `AdminProduct` |
| **Products** | `/products/[id]` | `PUT` | `/api/v1/admin/products/:id` | `products:update` | Product JSON payload | `AdminProduct` |
| **Products** | `/products/[id]` | `DELETE` | `/api/v1/admin/products/:id` | `products:delete` | `id` (path) | `{ archived: true }` |
| **Categories** | `/categories` | `GET` | `/api/v1/admin/categories` | `categories:read` | `page`, `limit`, `search` | `Category[]` |
| **Categories** | `/categories` | `POST` | `/api/v1/admin/categories` | `categories:create` | Category payload | `Category` |
| **Categories** | `/categories/[id]` | `PUT` | `/api/v1/admin/categories/:id` | `categories:update` | Category payload | `Category` |
| **Collections** | `/collections` | `GET` | `/api/v1/admin/collections` | `collections:read` | `page`, `limit`, `search` | `Collection[]` |
| **Collections** | `/collections` | `POST` | `/api/v1/admin/collections` | `collections:create` | Collection payload | `Collection` |
| **Attributes** | `/attributes` | `GET` | `/api/v1/admin/attributes` | `attributes:read` | `page`, `limit` | `Attribute[]` |
| **Attributes** | `/attributes/[id]/values`| `POST` | `/api/v1/admin/attributes/:id/values` | `attributes:create` | Value payload | `AttributeValue` |
| **Inventory** | `/inventory` | `GET` | `/api/v1/admin/inventory` | `inventory:read` | `page`, `limit`, `search`, `status` | `InventoryBalance[]` |
| **Inventory** | `/inventory` | `POST` | `/api/v1/admin/inventory/adjust` | `inventory:adjust` | `StockAdjustmentPayload` | `InventoryBalance` |
| **Movements** | `/inventory/movements` | `GET` | `/api/v1/admin/inventory/movements` | `inventory:read` | `page`, `limit`, `variantId` | `InventoryMovement[]` |
| **Reservations**| `/inventory/reservations`| `GET` | `/api/v1/admin/inventory/reservations` | `inventory:read` | `page`, `limit`, `variantId` | `InventoryReservation[]` |
| **Orders** | `/orders` | `GET` | `/api/v1/admin/orders` | `orders:read` | `page`, `limit`, `search`, `status` | `AdminOrder[]` |
| **Orders** | `/orders/[id]` | `GET` | `/api/v1/admin/orders/:id` | `orders:read` | `id` (path) | `AdminOrder` |
| **Orders** | `/orders/[id]` | `PATCH` | `/api/v1/admin/orders/:id/status` | `orders:update_status` | `{ status, reason }` | `AdminOrder` |
| **Fulfillment** | `/shipments` | `GET` | `/api/v1/admin/fulfillment` | `fulfillment:read` | `page`, `limit`, `status` | `FulfillmentPackage[]` |
| **Fulfillment** | `/shipments` | `POST` | `/api/v1/admin/fulfillment` | `fulfillment:create` | Shipment payload | `FulfillmentPackage` |
| **Payments** | `/payments` | `GET` | `/api/v1/admin/payments` | `payments:read` | `page`, `limit`, `status` | `Payment[]` |
| **Invoices** | `/invoices` | `GET` | `/api/v1/admin/payments/invoices` | `payments:read` | `page`, `limit` | `Invoice[]` |
| **Customers** | `/customers` | `GET` | `/api/v1/admin/customers` | `customers:read` | `page`, `limit`, `search`, `status` | `Customer[]` |
| **Customers** | `/customers/[id]` | `GET` | `/api/v1/admin/customers/:id` | `customers:read` | `id` (path) | `CustomerDetail` |
| **Coupons** | `/coupons` | `GET` | `/api/v1/admin/coupons` | `coupons:read` | `page`, `limit`, `status` | `Coupon[]` |
| **Coupons** | `/coupons/new` | `POST` | `/api/v1/admin/coupons` | `coupons:create` | Coupon payload | `Coupon` |
| **Reviews** | `/reviews` | `GET` | `/api/v1/admin/reviews` | `reviews:read` | `page`, `limit`, `rating`, `published` | `ProductReview[]` |
| **Reviews** | `/reviews/[id]/publish` | `PATCH` | `/api/v1/admin/reviews/:id/publish` | `reviews:moderate` | `{ isPublished: boolean }` | `ProductReview` |
| **Returns** | `/returns` | `GET` | `/api/v1/admin/returns` | `returns:read` | `page`, `limit`, `status` | `AdminReturn[]` |
| **Returns** | `/returns/[id]/status` | `PATCH` | `/api/v1/admin/returns/:id/status` | `returns:update` | `{ status, notes }` | `AdminReturn` |
| **Refunds** | `/refunds` | `POST` | `/api/v1/admin/returns/refunds` | `refunds:create` | `ProcessRefundPayload` | `Refund` |
| **Admin Users** | `/admin-users` | `GET` | `/api/v1/admin/admin-users` | `admin_users:read` | `page`, `limit`, `status` | `AdminUser[]` |
| **Admin Users** | `/admin-users` | `POST` | `/api/v1/admin/admin-users` | `admin_users:create` | Staff payload | `AdminUser` |
| **Roles** | `/roles` | `GET` | `/api/v1/admin/roles` | `roles:read` | `page`, `limit` | `Role[]` |
| **Roles** | `/roles/[id]` | `PUT` | `/api/v1/admin/roles/:id` | `roles:update` | `{ name, permissions }` | `Role` |
| **Audit Logs** | `/audit-logs` | `GET` | `/api/v1/admin/audit-logs` | `audit_logs:read` | `page`, `limit`, `search`, `entityType` | `AuditLog[]` |
