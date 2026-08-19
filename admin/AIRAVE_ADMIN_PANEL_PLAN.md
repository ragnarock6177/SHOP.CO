# AIRAVE E-Commerce Admin Panel — Complete Plan

## 1. Purpose

This document defines the complete admin-panel plan for the AIRAVE single-brand / single-vendor fashion e-commerce application.

The plan is derived from `DATABASE_DESIGN.md`. The existing PostgreSQL design is the source of truth.

The admin panel must be a **business-operation interface**, not a generic database CRUD UI.

Supporting tables such as status histories, join tables, payment transactions, shipment items, coupon usages, and return items should normally be managed through their parent business resource rather than exposed as independent CRUD screens.

---

# 2. Database Scope Used by the Admin Panel

The database contains the following major domains:

- Users
- Roles
- Permissions
- User roles
- Role permissions
- User addresses
- Collections
- Categories
- Collection-category relationships
- Products
- Product-category relationships
- Product-collection relationships
- Product images
- Product videos
- Attributes
- Attribute values
- Product attribute values
- Product variants
- Variant attribute values
- Variant images
- Price history
- Inventory
- Inventory movements
- Inventory reservations
- Wishlists
- Wishlist items
- Carts
- Cart items
- Orders
- Order addresses
- Order items
- Order status history
- Shipments
- Shipment items
- Shipment status history
- Payments
- Payment transactions
- Invoices
- Product reviews
- Review images
- Coupons
- Coupon products
- Coupon categories
- Coupon usages
- Returns
- Return items
- Refunds
- Audit logs

The schema also defines explicit enums for user, product, visibility, category, cart, order, payment, invoice, shipment, inventory movement, address, discount, return, and refund states.

---

# 3. Admin Navigation

Recommended primary navigation:

```text
Dashboard

CATALOG
  Products
  Categories
  Collections
  Attributes

INVENTORY
  Inventory
  Inventory Movements
  Reservations

SALES
  Orders
  Shipments
  Payments
  Invoices

CUSTOMERS
  Customers

MARKETING
  Coupons

ENGAGEMENT
  Reviews

AFTER SALES
  Returns
  Refunds

ADMINISTRATION
  Admin Users
  Roles & Permissions
  Audit Logs
```

Do not expose every database table as a navigation item.

---

# 4. Admin Roles and RBAC

The database seeds these roles:

- CUSTOMER
- ADMIN
- SUPER_ADMIN

The authorization system uses:

```text
users
  ↓
user_roles
  ↓
roles
  ↓
role_permissions
  ↓
permissions
```

The backend must enforce permissions. Hiding a frontend button is not security.

## Recommended permission groups

Permission names should be finalized against the actual application requirements.

Examples:

```text
dashboard.read

products.read
products.create
products.update
products.delete
products.publish

categories.read
categories.create
categories.update
categories.delete

collections.read
collections.create
collections.update
collections.delete

attributes.read
attributes.create
attributes.update
attributes.delete

inventory.read
inventory.adjust
inventory.movements.read
inventory.reservations.read

orders.read
orders.update
orders.cancel

shipments.read
shipments.create
shipments.update

payments.read
payment_transactions.read

invoices.read
invoices.create
invoices.update

customers.read
customers.update
customers.suspend

reviews.read
reviews.moderate

coupons.read
coupons.create
coupons.update
coupons.delete

returns.read
returns.update

refunds.read
refunds.create
refunds.process

admins.read
admins.create
admins.update
admins.delete

roles.read
roles.manage

permissions.read
permissions.manage

audit_logs.read
```

Do not assume these exact permission names already exist. They are an implementation proposal.

## SUPER_ADMIN

SUPER_ADMIN should control sensitive administrative operations such as:

- Admin user management
- Role management
- Permission management
- Granting/revoking sensitive permissions
- Other system-level operations

An ADMIN must not be able to escalate their own permissions.

---

# 5. Dashboard

The dashboard is an operational overview.

## KPI cards

Use metrics that can be reliably derived from the existing database:

- Orders
- Sales / order totals
- Pending orders
- Processing orders
- Shipped orders
- Delivered orders
- Pending returns
- Pending refunds
- Low-stock variants
- Out-of-stock variants
- Customers

## Dashboard sections

### Sales overview

Support:

- Today
- Last 7 days
- Last 30 days
- Custom date range

### Order overview

Show counts by the actual `order_status` enum:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
PARTIALLY_CANCELLED
REFUNDED
PARTIALLY_REFUNDED
FAILED
```

### Inventory alerts

Show:

- Low stock
- Out of stock
- Reserved stock
- Active reservations

Available inventory should be calculated as:

```text
quantity_on_hand - quantity_reserved
```

because the schema stores both values.

### Recent orders

Show:

- Order number
- Customer
- Status
- Total
- Created/placed date

### Recent admin activity

Show recent audit events where appropriate.

---

# 6. Product Management

Products are the main catalog resource.

The product editor should manage related resources in one workflow.

## Product list

Columns:

```text
Product
SKU / Variant
Status
Visibility
Category
Price
Stock
Created
Updated
Actions
```

Recommended filters:

```text
Search
Status
Visibility
Category
Collection
Product Type
Price Range
Stock Status
Attribute
Created Date
Updated Date
```

Product status values:

```text
DRAFT
ACTIVE
INACTIVE
OUT_OF_STOCK
ARCHIVED
```

Visibility:

```text
PUBLIC
PRIVATE
HIDDEN
```

## Product actions

Depending on permissions:

- View
- Edit
- Publish
- Unpublish
- Activate
- Deactivate
- Archive
- Restore where soft deletion is supported
- Delete/soft-delete where appropriate

Do not allow arbitrary edits to system fields such as IDs or timestamps.

---

# 7. Product Editor

Recommended tabs:

```text
Basic Information
Categories
Collections
Attributes
Variants
Media
SEO
Preview
```

## Basic information

Fields supported by the schema:

- Name
- Slug
- Description
- Short description
- Product type
- Status
- Visibility
- Base price
- Compare-at price
- Currency
- Tax code
- Care instructions
- Meta title
- Meta description

The database has non-negative checks for base and compare-at prices.

## Categories

Manage:

- Primary category
- Additional categories

The schema has `product_categories.is_primary`.

Do not expose `product_categories` as an independent CRUD page.

## Collections

Allow:

- Assign collection
- Remove collection
- Reorder collection association

The schema stores `sort_order`.

---

# 8. Product Media

Product media is managed from the Product Editor.

## Images

Support:

- Add image
- Remove image
- Reorder images
- Set primary image
- Edit alt text

Fields:

```text
image_url
alt_text
sort_order
is_primary
```

## Videos

Support:

- Add video
- Remove video
- Reorder video
- Thumbnail
- Title

Fields:

```text
video_url
thumbnail_url
title
sort_order
```

## Variant images

Variant images should be managed from the Variant section using the existing `variant_images` relationship.

---

# 9. Attributes

The database seeds common clothing attributes:

```text
Color
Size
Fabric
Fit
Pattern
Neck Type
Sleeve Type
Age Group
Waist
```

The schema also supports:

```text
is_variant_attribute
is_filterable
is_visible
sort_order
```

## Attribute list

Columns:

```text
Name
Slug
Variant Attribute
Filterable
Visible
Sort Order
Values Count
Actions
```

## Attribute editor

Support:

- Name
- Slug
- Description
- Variant attribute
- Filterable
- Visible
- Sort order

## Attribute values

Manage values inside an Attribute.

Fields:

```text
Value
Slug
Color Hex
Image URL
Sort Order
```

Do not expose `attribute_values` as a disconnected top-level navigation page unless operationally necessary.

---

# 10. Product Variants

Variants are managed inside the Product Editor.

Fields supported by the schema:

- SKU
- Barcode
- Variant name
- Price
- Compare-at price
- Cost price
- Weight in grams
- Default variant
- Active state

The schema requires:

```text
price >= 0
compare_at_price >= price when present
cost_price >= 0 when present
weight_grams >= 0 when present
```

## Variant table

```text
SKU
Variant
Attributes
Price
Compare Price
Cost
Stock
Active
Default
Actions
```

## Variant actions

- Create
- Edit
- Activate/deactivate
- Set default
- Manage attributes
- Manage images
- View inventory
- View price history

SKU is unique and should never be silently changed to a conflicting SKU.

---

# 11. Price History

Price history is a read-oriented child resource.

Show:

```text
Variant
Price
Compare-at Price
Valid From
Valid Until
Changed By
Created At
```

When changing a variant price, the service layer should preserve the history according to the application's price-history rules.

Do not expose price history as arbitrary editable CRUD.

---

# 12. Inventory Management

Inventory is variant-level.

The schema stores:

```text
quantity_on_hand
quantity_reserved
reorder_level
version
```

## Inventory list

Columns:

```text
SKU
Product
Variant
On Hand
Reserved
Available
Reorder Level
Stock Status
Updated
Actions
```

Available:

```text
Available = On Hand - Reserved
```

## Inventory filters

```text
Search SKU / Product / Barcode

Stock Status
Category
Collection
Product
Variant

Available Quantity
Reserved Quantity

Low Stock
Out of Stock

Last Updated
```

## Stock status

Recommended derived statuses:

```text
OUT_OF_STOCK
LOW_STOCK
IN_STOCK
```

`LOW_STOCK` should be based on `available quantity <= reorder_level` according to the agreed application rule.

Do not create a new database enum merely for this UI classification unless required.

---

# 13. Inventory Adjustment

Admin stock adjustment must be an explicit business operation.

UI:

```text
Variant
Current On Hand
Current Reserved
Available

Adjustment Type
Quantity
Reason / Notes

Confirm Adjustment
```

Supported movement types include:

```text
INITIAL
PURCHASE
SALE
RESERVATION
RELEASE
RETURN
ADJUSTMENT
DAMAGE
LOSS
```

A manual adjustment must:

1. Validate the variant.
2. Validate quantity.
3. Safely update inventory.
4. Respect reservations.
5. Create an `inventory_movements` record.
6. Record the admin responsible through `created_by`.
7. Create an audit log for the admin mutation where appropriate.

Never silently overwrite inventory without a movement record.

Use a transaction for the inventory mutation and movement creation.

The `version` field should be considered when implementing concurrency-safe inventory updates.

---

# 14. Inventory Movements

Read-only operational history.

Filters:

```text
SKU
Product
Variant
Movement Type
Reference Type
Reference ID
Created By
Date Range
```

Columns:

```text
Date
SKU
Movement
Quantity
Reference
Notes
Created By
```

Do not allow arbitrary editing/deletion of movement history.

---

# 15. Inventory Reservations

Reservations should be visible as operational information.

Fields:

```text
Variant
Cart
Order
Quantity
Expires At
Released At
Created At
```

Useful filters:

```text
Active / Released
Variant
Order
Cart
Expiration Date
```

Do not let admins arbitrarily edit reservation rows. Reservation state should be controlled by the inventory/cart/order business logic.

---

# 16. Customer Management

The `users` table supports:

```text
email
password_hash
first_name
last_name
phone
status
email_verified_at
phone_verified_at
last_login_at
deleted_at
```

User statuses:

```text
PENDING
ACTIVE
SUSPENDED
BLOCKED
DEACTIVATED
```

## Customer list

Filters:

```text
Search name
Search email
Search phone
Status
Email verified
Phone verified
Created date
Last login
```

Columns:

```text
Customer
Email
Phone
Status
Email Verified
Phone Verified
Orders
Created
Last Login
```

## Customer details

Sections:

```text
Profile
Addresses
Orders
Reviews
Wishlist information where useful
Activity
```

Do not expose `password_hash`.

## Customer actions

Depending on permissions:

- View
- Update profile fields
- Suspend
- Block
- Activate
- Deactivate

Do not allow admins to arbitrarily modify verification timestamps without an explicit business requirement.

---

# 17. Orders

Orders are the main sales workflow.

## Order list

Columns:

```text
Order Number
Customer
Status
Payment
Shipment
Items
Total
Placed At
Created At
Actions
```

## Order filters

```text
Search
  Order Number
  Customer Name
  Customer Email
  Customer Phone

Order Status

Payment Status

Shipment Status

Payment Provider

Amount Range

Order Date Range

Return Status

Refund Status
```

Use one Orders page with filters instead of separate pages for every status.

Recommended quick views:

```text
All
Pending
Processing
Shipped
Delivered
Cancelled
Failed
Returns
Refunds
```

These are predefined filters, not separate database resources.

---

# 18. Order Details

Order details should be one business workspace.

Sections:

```text
Order Summary
Customer
Items
Shipping Address
Billing Address
Payment
Shipment
Returns
Refunds
Invoice
Status Timeline
Notes
```

Order item information is snapshot data. The admin UI must display the snapshot stored in `order_items` rather than assuming the current product name/price is identical to the historical order.

Snapshot fields include:

```text
sku
product_name
variant_name
quantity
unit_price
discount_amount
tax_amount
total_amount
```

---

# 19. Order Status Workflow

Order status enum:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
PARTIALLY_CANCELLED
REFUNDED
PARTIALLY_REFUNDED
FAILED
```

Do not implement unrestricted status editing.

Use a controlled action:

```text
Current Status
New Status
Reason
Confirm
```

The service must validate allowed transitions according to the application's business rules.

Every status change should create:

```text
order_status_history
```

with:

```text
old_status
new_status
changed_by
reason
created_at
```

Use a transaction when status change and required dependent operations must be atomic.

---

# 20. Shipments

Shipments belong to orders.

Fields:

```text
Status
Carrier
Tracking Number
Tracking URL
Shipping Method
Estimated Delivery
Shipped At
Delivered At
```

Shipment status enum:

```text
PENDING
PROCESSING
PACKED
SHIPPED
IN_TRANSIT
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURNED
```

## Shipment filters

```text
Status
Carrier
Shipping Method
Tracking Number
Date Range
```

Shipment details should show:

```text
Shipment
Order
Shipment Items
Tracking
Status
Status History
```

Do not expose shipment status history as an independent CRUD resource.

---

# 21. Payments

Payments should be primarily read-oriented from the admin UI.

Fields:

```text
Provider
Provider Payment ID
Status
Currency
Amount
Failure Code
Failure Message
Authorized At
Captured At
Refunded At
```

Payment status:

```text
PENDING
AUTHORIZED
CAPTURED
PARTIALLY_REFUNDED
REFUNDED
FAILED
CANCELLED
```

## Payment list filters

```text
Order
Provider
Status
Amount
Date Range
Provider Payment ID
```

## Payment details

Show:

```text
Payment
Order
Provider
Payment Status
Amount
Transactions
Failure Information
Refunds
```

Do not allow arbitrary payment-status editing.

Payment state should follow the application's payment-provider/business workflow.

---

# 22. Payment Transactions

Transactions are child records of a payment.

Transaction types:

```text
AUTHORIZATION
CAPTURE
SALE
REFUND
VOID
CHARGEBACK
```

Show:

```text
Transaction Type
Provider Transaction ID
Amount
Currency
Status
Created At
Gateway Response where safe
```

Sensitive gateway data must not be exposed unnecessarily.

---

# 23. Invoices

Invoice is linked one-to-one with an order.

Fields:

```text
Invoice Number
Status
Currency
Subtotal
Tax
Discount
Total
Issued At
Paid At
PDF URL
```

Invoice statuses:

```text
DRAFT
ISSUED
PAID
CANCELLED
REFUNDED
```

Admin actions should follow business rules, not arbitrary status editing.

If PDF generation/download exists in the application, expose it through a secure backend endpoint rather than trusting a raw client URL.

---

# 24. Reviews

Reviews support:

```text
rating
title
body
is_verified_purchase
is_published
deleted_at
```

Rating is constrained to 1–5.

## Review list

Columns:

```text
Rating
Title
Customer
Product
Verified Purchase
Published
Created
Actions
```

## Review filters

```text
Search
Rating
Published / Unpublished
Verified Purchase
Product
Category
Date Range
```

## Review actions

- View
- Publish
- Unpublish
- Soft-delete where appropriate

Review images should appear inside review details.

Do not create independent CRUD navigation for `review_images`.

---

# 25. Coupons

Coupon fields:

```text
code
description
discount_type
discount_value
minimum_order_amount
maximum_discount_amount
usage_limit
usage_limit_per_user
used_count
starts_at
expires_at
is_active
```

Discount types:

```text
FIXED
PERCENTAGE
```

Database constraints include:

- discount value must be greater than zero
- percentage discount cannot exceed 100
- usage limit cannot be negative

## Coupon list

Columns:

```text
Code
Discount
Usage
Start
Expiry
Active
Actions
```

## Coupon filters

```text
Search Code

Discount Type

Active / Inactive

Currently Valid / Expired / Upcoming

Start Date

Expiry Date

Usage Range
```

## Coupon editor

Manage:

```text
Basic Details
Discount
Minimum Order
Maximum Discount
Usage Limits
Schedule
Active State
Applicable Products
Applicable Categories
```

Do not expose coupon-product and coupon-category join tables as independent CRUD.

---

# 26. Coupon Usage

Coupon usage should be visible from the Coupon Details page.

Show:

```text
Customer
Order
Discount Amount
Used At
```

Filters:

```text
Customer
Order
Date Range
```

Do not allow admins to manually modify usage records.

---

# 27. Returns

Return fields:

```text
Order
User
Status
Reason
Customer Note
Admin Note
Requested At
Approved At
Completed At
```

Return statuses:

```text
REQUESTED
APPROVED
REJECTED
PICKED_UP
RECEIVED
INSPECTED
REFUNDED
CANCELLED
```

Return reasons:

```text
WRONG_SIZE
WRONG_PRODUCT
DAMAGED
DEFECTIVE
NOT_AS_EXPECTED
CHANGED_MIND
OTHER
```

## Return list filters

```text
Search Order
Customer
Status
Reason
Date Range
```

## Return workflow

Recommended workflow:

```text
REQUESTED
   ↓
APPROVED / REJECTED
   ↓
PICKED_UP
   ↓
RECEIVED
   ↓
INSPECTED
   ↓
REFUNDED
```

Actual transitions must be implemented according to the approved business rules.

Return items should be handled within Return Details.

---

# 28. Refunds

Refund fields:

```text
Order
Payment
Return
Amount
Currency
Status
Provider Refund ID
Reason
Processed At
```

Refund statuses:

```text
PENDING
PROCESSING
COMPLETED
FAILED
CANCELLED
```

## Refund list filters

```text
Order
Payment
Return
Status
Amount
Date Range
```

Refunds should not be marked completed by directly editing a status.

The refund service should coordinate provider processing and database state.

---

# 29. Categories

Category fields:

```text
parent_id
name
slug
description
image_url
status
sort_order
meta_title
meta_description
deleted_at
```

Category status:

```text
ACTIVE
INACTIVE
```

## Category UI

Use a tree/hierarchy view:

```text
Clothing
├── Men
│   ├── T-Shirts
│   ├── Shirts
│   └── Jeans
└── Women
    ├── Tops
    └── Dresses
```

Actions:

- Create category
- Create child category
- Edit
- Activate/deactivate
- Reorder
- Soft-delete where allowed

Do not allow deleting a category if existing relationships/business constraints prevent it.

---

# 30. Collections

Collections support:

```text
name
slug
description
image_url
status
sort_order
meta_title
meta_description
deleted_at
```

Example seeded/business concepts include:

```text
Men
Women
Kids
Summer Collection
New Arrivals
Festive Collection
```

Manage product and category relationships from Collection Details.

---

# 31. Carts and Wishlists

These are primarily customer-facing resources and are not core admin CRUD modules.

The admin panel may expose limited read-only information where operationally useful.

## Carts

Useful for:

- abandoned cart analytics
- active cart count
- expired cart analysis

Cart statuses:

```text
ACTIVE
CONVERTED
ABANDONED
EXPIRED
```

Do not allow admins to arbitrarily modify customer carts unless a specific business requirement is approved.

## Wishlists

Use for read-only analytics if required.

Do not create a primary navigation item unless the business needs it.

---

# 32. Audit Logs

Audit logs are mandatory for sensitive admin operations.

Schema fields:

```text
user_id
entity_type
entity_id
action
old_values
new_values
ip_address
user_agent
created_at
```

## Audit log list

Filters:

```text
Admin User
Entity Type
Entity ID
Action
Date Range
IP Address
```

Columns:

```text
Time
Admin
Action
Entity
Entity ID
IP
```

## Audit details

Show:

```text
Admin
Action
Entity
Old Values
New Values
IP
User Agent
Timestamp
```

Audit logs must be read-only.

Do not provide delete/edit functionality.

Sensitive values must be redacted where necessary.

---

# 33. Global Search

If implemented, global admin search can search across:

```text
Products
SKU
Orders
Order Number
Customers
Email
Phone
Coupons
Tracking Number
Invoice Number
```

Search should use explicit resource-specific queries rather than unrestricted database querying.

---

# 34. Filtering Architecture

Products, Orders, Inventory, Customers, Reviews, Coupons, Returns, Refunds and other large collections should use server-side filtering.

## Product filters

```text
Search
Status
Visibility
Category
Collection
Product Type
Price Range
Stock Status
Attribute
Created Date
Updated Date
```

## Order filters

```text
Order Number
Customer
Email
Phone
Order Status
Payment Status
Shipment Status
Payment Provider
Amount Range
Date Range
Return Status
Refund Status
```

## Inventory filters

```text
SKU
Product
Barcode
Category
Collection
Stock Status
Available Quantity
Reserved Quantity
Low Stock
Out of Stock
Last Updated
```

## Customer filters

```text
Name
Email
Phone
Status
Email Verification
Phone Verification
Created Date
Last Login
```

## Review filters

```text
Rating
Published
Verified Purchase
Product
Category
Date Range
```

## Coupon filters

```text
Code
Discount Type
Active
Valid
Expired
Upcoming
Date Range
Usage Range
```

All query parameters must be explicitly validated and mapped to Prisma queries.

Never accept arbitrary Prisma `where`, `orderBy`, `include`, or `select` objects from clients.

---

# 35. Pagination

Every potentially large collection must be paginated.

Recommended response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Use a maximum page size.

Do not allow unlimited collection queries.

---

# 36. Sorting

Allow controlled sorting fields.

Example Products:

```text
createdAt
updatedAt
name
price
```

Orders:

```text
createdAt
placedAt
totalAmount
status
```

Inventory:

```text
availableQuantity
quantityOnHand
quantityReserved
updatedAt
```

Do not expose arbitrary database field sorting.

---

# 37. API Architecture

Recommended admin API base:

```text
/api/v1/admin
```

Architecture:

```text
Request
  ↓
Admin Authentication
  ↓
Permission Middleware
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

Controllers should not contain business logic.

Services should contain business rules and transactions.

---

# 38. Suggested Admin API Resource Groups

```text
/api/v1/admin/dashboard

/api/v1/admin/products
/api/v1/admin/categories
/api/v1/admin/collections
/api/v1/admin/attributes

/api/v1/admin/inventory
/api/v1/admin/inventory/movements
/api/v1/admin/inventory/reservations

/api/v1/admin/orders
/api/v1/admin/shipments
/api/v1/admin/payments
/api/v1/admin/invoices

/api/v1/admin/customers

/api/v1/admin/coupons

/api/v1/admin/reviews

/api/v1/admin/returns
/api/v1/admin/refunds

/api/v1/admin/admin-users
/api/v1/admin/roles
/api/v1/admin/permissions

/api/v1/admin/audit-logs
```

These are resource-group proposals, not a command to blindly expose every database table.

---

# 39. API Response Contract

Use a consistent response format.

Success:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

List:

```json
{
  "success": true,
  "data": [],
  "pagination": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

Never expose:

- password hashes
- internal secrets
- unnecessary gateway data
- stack traces
- raw database errors

---

# 40. Transactions

Use database transactions for operations that must remain atomic.

Examples:

### Inventory adjustment

```text
Update inventory
+
Create movement
+
Audit log
```

### Order status transition

Where required:

```text
Update order
+
Create status history
+
Dependent inventory/shipment changes
+
Audit log
```

### Return/refund processing

Where required:

```text
Update return
+
Create/process refund
+
Payment state update
+
Inventory update where applicable
+
Audit log
```

The exact transaction boundaries must be determined during implementation based on the business workflow.

---

# 41. Soft Delete

The schema uses `deleted_at` on several resources including:

- users
- collections
- categories
- products
- product variants
- reviews
- orders

Admin list APIs should normally exclude soft-deleted records by default.

Where recovery is a valid business operation, provide a restore operation instead of physically deleting records.

Do not expose `deleted_at` as a normal editable field.

---

# 42. Security

Admin security requirements:

- Authentication required
- Permission-based authorization
- Server-side permission checks
- IDOR protection
- Input validation
- Mass-assignment protection
- Sensitive-field filtering
- Rate limiting where appropriate
- Request size limits
- Secure CORS configuration
- Security headers
- Audit logging
- No privilege escalation

Frontend permissions are only for UX. Backend permissions are the actual security boundary.

---

# 43. Admin Frontend Architecture

If an admin frontend already exists, inspect and reuse its architecture.

Recommended structure:

```text
AdminLayout
├── Sidebar
├── Header
├── Breadcrumbs
└── Page Content
```

Common components:

```text
DataTable
FilterBar
SearchInput
FilterSelect
DateRangePicker
Pagination
SortControl
StatusBadge
ConfirmDialog
Drawer
Modal
Form
Tabs
EmptyState
LoadingState
ErrorState
```

Navigation should be permission-aware.

---

# 44. Product Admin UX

Recommended product workflow:

```text
Products
  ↓
Product List
  ↓
Create/Edit Product
  ├── Basic
  ├── Categories
  ├── Collections
  ├── Attributes
  ├── Variants
  │    ├── Variant Attributes
  │    ├── Pricing
  │    ├── Images
  │    └── Inventory
  ├── Media
  ├── SEO
  └── Preview
```

This prevents the admin from having to navigate through many disconnected database screens.

---

# 45. Order Admin UX

```text
Orders
  ↓
Order List
  ↓
Order Details
  ├── Summary
  ├── Customer
  ├── Items
  ├── Addresses
  ├── Payment
  ├── Shipment
  ├── Returns
  ├── Refunds
  ├── Invoice
  └── Timeline
```

The order is the business object; its supporting records appear inside it.

---

# 46. Inventory Admin UX

```text
Inventory
  ↓
Inventory List
  ↓
Inventory Details
  ├── Current Stock
  ├── Reserved Stock
  ├── Available Stock
  ├── Reorder Level
  ├── Adjustment
  ├── Movement History
  └── Active Reservations
```

---

# 47. Admin Development Phases

## Phase 1 — Admin API foundation

Implement:

- `/api/v1/admin`
- authentication middleware
- permission middleware
- validation
- response format
- error handling
- pagination
- filtering utilities
- sorting utilities
- audit helper
- admin route structure

## Phase 2 — RBAC

Implement:

- admin role resolution
- permissions
- role-permission checks
- admin user protection
- SUPER_ADMIN restrictions

## Phase 3 — Dashboard

Implement:

- KPI queries
- order overview
- sales overview
- inventory alerts
- recent orders
- recent audit activity

## Phase 4 — Catalog

Implement:

- Products
- Categories
- Collections
- Attributes
- Attribute values
- Variants
- Product media
- Price history

## Phase 5 — Inventory

Implement:

- Inventory list
- Inventory filters
- Inventory details
- Adjustments
- Movement history
- Reservations

## Phase 6 — Customers

Implement:

- Customer list
- Customer details
- Addresses
- Orders
- Reviews
- Status management

## Phase 7 — Orders

Implement:

- Order list
- Search
- Filters
- Order details
- Status transitions
- Status history

## Phase 8 — Fulfillment

Implement:

- Shipment list
- Shipment details
- Shipment item management
- Tracking
- Shipment status workflow

## Phase 9 — Payments and invoices

Implement:

- Payments
- Payment transactions
- Invoices
- Secure provider information display

## Phase 10 — Returns and refunds

Implement:

- Returns
- Return items
- Return workflow
- Refunds
- Refund processing

## Phase 11 — Marketing

Implement:

- Coupons
- Product/category targeting
- Usage information

## Phase 12 — Reviews

Implement:

- Review list
- Moderation
- Review details
- Review images

## Phase 13 — Administration

Implement:

- Admin users
- Roles
- Permissions
- Role-permission assignment
- User-role assignment

## Phase 14 — Audit

Implement:

- Audit creation
- Audit list
- Filters
- Audit detail
- Read-only protection

## Phase 15 — Testing and hardening

Implement:

- API tests
- Permission tests
- Validation tests
- Workflow tests
- Transaction tests
- Security tests
- Performance checks

## Phase 16 — Frontend integration

Implement:

- Admin layout
- Navigation
- Dashboard
- Catalog
- Inventory
- Orders
- Customers
- Marketing
- Reviews
- Returns/refunds
- Administration
- Audit logs

---

# 48. Testing Requirements

Every admin module should test:

### Authentication

- unauthenticated request
- expired/invalid authentication

### Authorization

- missing permission
- wrong role
- privilege escalation attempt
- SUPER_ADMIN-only operation

### Validation

- invalid IDs
- invalid enums
- invalid quantities
- invalid prices
- invalid dates
- invalid pagination
- invalid filters

### Product

- create
- update
- variant management
- category assignment
- collection assignment
- media
- publish/unpublish

### Inventory

- adjustment
- movement creation
- reservation constraints
- concurrent update handling

### Orders

- search
- filters
- status transition
- invalid transition
- history creation

### Payments

- read access
- transaction display
- sensitive information filtering

### Returns/refunds

- valid transition
- invalid transition
- refund processing
- relationship validation

### Coupons

- creation
- validation
- activation
- expiry
- targeting
- usage limits

### Reviews

- moderation
- publication
- soft deletion

### RBAC

- permission assignment
- permission removal
- admin restrictions

### Audit

- mutation generates audit
- correct old/new values
- correct actor
- audit is read-only

---

# 49. Important Rules for the Coding Agent

The following rules are mandatory:

```text
1. DATABASE_DESIGN.md and the actual Prisma schema are the source of truth.

2. Never invent models.

3. Never invent fields.

4. Never invent relationships.

5. Never modify Prisma schema to make an admin API easier.

6. Never create migrations during admin implementation unless explicitly approved.

7. Do not expose every database table as CRUD.

8. Build business-oriented admin workflows.

9. Do not expose arbitrary Prisma query objects to the client.

10. Validate every request.

11. Enforce authorization on the backend.

12. Do not rely on frontend permissions for security.

13. Protect password_hash and sensitive payment/provider data.

14. Do not directly edit historical movement/status/audit records.

15. Use transactions for atomic business operations.

16. Record admin mutations in audit_logs where appropriate.

17. Respect soft deletion.

18. Respect all existing enum values and database constraints.

19. Inspect existing code before creating new infrastructure.

20. Reuse existing project patterns rather than creating duplicate architecture.
```

---

# 50. Spec Kit Workflow

The admin implementation must be gated.

```text
/specify
      ↓
STOP
      ↓
Review specification
      ↓
/plan
      ↓
STOP
      ↓
Review plan
      ↓
/tasks
      ↓
STOP
      ↓
Review tasks
      ↓
Explicit implementation request
      ↓
Implement one approved task/phase
      ↓
Test
      ↓
STOP
```

The `/specify`, `/plan`, and `/tasks` phases must not automatically implement code.

---

# 51. Database Change Policy

The database design is already established.

If an admin requirement cannot be implemented using the existing schema:

STOP.

Report:

```text
Problem
Affected table/model
Affected field/relationship
Required change
Reason
Affected API
Potential migration impact
```

Do not silently modify:

```text
prisma/schema.prisma
```

Do not create a migration without explicit approval.

---

# 52. Final Admin Architecture

The intended architecture is:

```text
                    ADMIN FRONTEND
                          │
                          ▼
                 /api/v1/admin/*
                          │
                          ▼
                 Authentication
                          │
                          ▼
                  Permission Check
                          │
                          ▼
                     Validation
                          │
                          ▼
                    Controller
                          │
                          ▼
                      Service
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
          Prisma                  Audit Log
              │
              ▼
          PostgreSQL
```

Business-oriented resources:

```text
Catalog
  └── Products
       ├── Categories
       ├── Collections
       ├── Attributes
       ├── Variants
       ├── Media
       └── Price History

Inventory
  ├── Stock
  ├── Movements
  └── Reservations

Sales
  └── Orders
       ├── Items
       ├── Addresses
       ├── Payments
       ├── Shipments
       ├── Invoice
       ├── Returns
       └── Refunds

Administration
  ├── Users
  ├── Roles
  ├── Permissions
  └── Audit Logs
```

---

# 53. Definition of Done

The admin panel is considered complete only when:

- All approved admin resources are implemented.
- All APIs use the agreed `/api/v1/admin` structure.
- Authentication is enforced.
- Permissions are enforced server-side.
- Product, inventory and order filters work server-side.
- Pagination and sorting work.
- Business workflows are implemented instead of raw status editing.
- Inventory adjustments create movement records.
- Order status changes create history.
- Sensitive mutations are auditable.
- Payments/refunds are protected.
- Soft-deleted resources are handled correctly.
- Validation is implemented.
- Transactions are used where required.
- API tests pass.
- Frontend permission-aware navigation works.
- Loading, empty and error states are handled.
- No unauthorized database schema changes were made.
