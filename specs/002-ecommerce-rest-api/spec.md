# Feature Specification: Production-Ready REST API Layer Implementation

**Feature Branch**: `002-ecommerce-rest-api`  
**Created**: 2026-08-18  
**Status**: Draft  
**Input**: Build production-ready REST API layer on top of existing PostgreSQL / Prisma database schema (`backend/prisma/schema.prisma`).

---

## 1. Discovered Database & Domain Resources

The backend REST API layer is built on top of the 48 database models and 16 enums defined in the source-of-truth [`schema.prisma`](file:///d:/CS-Next/backend/prisma/schema.prisma):

### Domain Classification & Accessibility Matrix

| Domain / Resource Group | Model(s) | Public Access | User Access | Admin Access |
|---|---|---|---|---|
| **Authentication & Profile** | `User`, `UserAddress` | Registration, Login | Profile, Password, Addresses (User-Owned) | User Management, Status Override |
| **RBAC & Governance** | `Role`, `Permission`, `UserRole`, `RolePermission` | None | None | Full CRUD, Role Assignment |
| **Catalog Taxonomy** | `Collection`, `Category`, `CollectionCategory` | Read Active Collections & Categories | Read Active | Full CRUD, Reordering, Meta |
| **Products & Variants** | `Product`, `ProductCategory`, `ProductCollection`, `ProductImage`, `ProductVideo`, `Attribute`, `AttributeValue`, `ProductAttributeValue`, `ProductVariant`, `VariantAttributeValue`, `VariantImage`, `PriceHistory` | Read Active & Public Products, Search, Filters, Variant Details | Read Active | Full CRUD, Pricing Override, Media Upload, Draft Publishing |
| **Inventory & Stock** | `Inventory`, `InventoryMovement`, `InventoryReservation` | Stock Availability Status | Checkout Stock Reservation | Stock Adjustment (`INITIAL`, `ADJUSTMENT`, `DAMAGE`, `LOSS`), Movement Audit |
| **Wishlist & Cart** | `Wishlist`, `WishlistItem`, `Cart`, `CartItem` | Guest Token Cart CRUD | User Wishlist & Cart CRUD | View Abandoned Carts |
| **Orders & Fulfillment** | `Order`, `OrderAddress`, `OrderItem`, `OrderStatusHistory`, `Shipment`, `ShipmentItem`, `ShipmentStatusHistory` | None | Own Order History, Place Order, Cancel Pending Order | Order Processing, Status Override, Tracking Number & Dispatch |
| **Payments & Invoices** | `Payment`, `PaymentTransaction`, `Invoice` | Webhook Listener | View Own Invoices & Payment Status | Capture Payment, Void, Manual Invoice Generation |
| **Marketing & Feedback** | `ProductReview`, `ReviewImage`, `Coupon`, `CouponProduct`, `CouponCategory`, `CouponUsage` | Read Published Reviews, Verify Coupon Code | Submit Review (Verified Purchase), Apply Coupon | Moderate Reviews, Coupon Management (Limits, Discounts) |
| **Returns & Refunds** | `Return`, `ReturnItem`, `Refund` | None | Request Return, View Return Status | Approve/Reject Return, Process Refund |
| **Audit Logs** | `AuditLog` | None | None | Read Audit Log History |

---

## 2. API Architecture & Layered Responsibilities

The application implements a decoupled, 5-tier layered architecture:

```text
HTTP Request 
   └──> Route (URL Routing & Middleware Attachment)
          └──> Middleware (Auth, RBAC, Zod Validation, Rate Limit)
                 └──> Controller (Request Extraction & HTTP Response Formatting)
                        └──> Service (Business Rules, Orchestration, Prisma Transactions)
                               └──> Data Access Layer / Prisma Client (PostgreSQL Persistence)
```

### Layer Constraints
1. **Routes (`src/routes/*.routes.ts`)**:
   - MUST only map endpoint paths and attach middleware pipelines.
   - MUST NOT contain business logic or DB calls.
2. **Controllers (`src/controllers/*.controller.ts`)**:
   - MUST parse validated parameters (`req.body`, `req.params`, `req.query`).
   - MUST call dedicated service methods.
   - MUST format standardized JSON responses (`200`, `201`, `204`).
   - MUST NOT query Prisma directly.
3. **Services (`src/services/*.service.ts`)**:
   - MUST encapsulate business rules, calculated amounts, and transactional boundaries (`prisma.$transaction`).
   - MUST throw structured custom exceptions (`NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`).
4. **Data Access / Prisma (`src/lib/prisma.ts`)**:
   - Encapsulates database execution, field selection (`select`), and explicit relation inclusion (`include`).
5. **Middleware (`src/middleware/`)**:
   - `auth.ts`: Decodes Firebase ID Tokens or JWT tokens; attaches `req.user`.
   - `rbac.ts`: Verifies user roles (`ADMIN`, `SUPER_ADMIN`) and permissions.
   - `validate.ts`: Validates request body, query, and path parameters against Zod schemas.
   - `errorHandler.ts`: Catches all thrown exceptions and formats unified error responses.

---

## 3. Standardized API Response Contract

All API endpoints MUST respond using a uniform JSON structure.

### 1. Success Response (Single Resource)
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```

### 2. Success Response (Collection with Pagination)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email address format"
      }
    ]
  }
}
```

### Sensitive Data Exclusion Policy
The following fields MUST ALWAYS be excluded from API responses using explicit Prisma `select` clauses:
- `passwordHash` / `password_hash`
- `JWT_SECRET` / Refresh Tokens / Internal API Secrets
- Payment gateway secret keys or raw credit card data
- Stack trace information in production environments (`NODE_ENV === 'production'`)

---

## 4. Authentication & Authorization Strategy

### Authentication Flow
1. **Firebase Authentication Integration**:
   - Client authenticates via Firebase Auth on frontend/mobile and obtains a Firebase ID Token.
   - Request includes header: `Authorization: Bearer <firebase_id_token>`.
   - Backend `authenticate` middleware verifies Firebase token via `firebase-admin` SDK.
   - Matches user in PostgreSQL via `User.firebaseUid`.
   - If user record does not exist in PostgreSQL, automatically provisions a user profile (`status: PENDING` or `ACTIVE`).
2. **Fallback JWT Authentication**:
   - Supports direct email/password login returning a signed JWT token containing `{ id: user.id, email: user.email, role: user.role }`.

### Authorization & RBAC
- **User Ownership Guard**: Users can only access and modify their own resources (`user_id === req.user.id`).
- **Role Guard**: Endpoints prefixed with `/api/v1/admin` require `ADMIN` or `SUPER_ADMIN` role checked via `UserRole` -> `Role`.
- **User Status Check**: Suspended, blocked, or deactivated users (`status: SUSPENDED | BLOCKED | DEACTIVATED`) are denied access immediately with HTTP 403.

---

## 5. Endpoints & Resource Mapping

### Base Path: `/api/v1`

#### 1. Authentication & Account (`/api/v1/auth`, `/api/v1/users`)
- `POST /api/v1/auth/register` (Public) - Register new user
- `POST /api/v1/auth/login` (Public) - Authenticate with email/password
- `POST /api/v1/auth/firebase-login` (Public) - Authenticate with Firebase ID Token
- `GET /api/v1/users/me` (Authenticated) - Get current user profile
- `PATCH /api/v1/users/me` (Authenticated) - Update profile info
- `GET /api/v1/users/me/addresses` (Authenticated) - Get user saved addresses
- `POST /api/v1/users/me/addresses` (Authenticated) - Add new address
- `PUT /api/v1/users/me/addresses/:id` (Authenticated) - Update address
- `DELETE /api/v1/users/me/addresses/:id` (Authenticated) - Soft delete address

#### 2. Taxonomy & Catalog (`/api/v1/collections`, `/api/v1/categories`, `/api/v1/products`)
- `GET /api/v1/collections` (Public) - List active collections
- `GET /api/v1/collections/:slug` (Public) - Get collection details & products
- `GET /api/v1/categories` (Public) - List active category tree
- `GET /api/v1/categories/:slug` (Public) - Get category details & products
- `GET /api/v1/products` (Public) - Search & filter products (`page`, `limit`, `category`, `collection`, `minPrice`, `maxPrice`, `search`, `sortBy`, `sortOrder`)
- `GET /api/v1/products/:slug` (Public) - Get product details, images, videos, attributes, and variants
- `GET /api/v1/products/:id/variants` (Public) - Get variants for product

#### 3. Cart & Wishlist (`/api/v1/cart`, `/api/v1/wishlist`)
- `GET /api/v1/cart` (Public/Guest Token or Auth) - Get active cart items & total
- `POST /api/v1/cart/items` (Public/Guest Token or Auth) - Add variant to cart
- `PATCH /api/v1/cart/items/:id` (Public/Guest Token or Auth) - Update cart item quantity
- `DELETE /api/v1/cart/items/:id` (Public/Guest Token or Auth) - Remove item from cart
- `POST /api/v1/cart/merge` (Authenticated) - Merge guest cart with user cart upon login
- `GET /api/v1/wishlist` (Authenticated) - Get user wishlist
- `POST /api/v1/wishlist/items` (Authenticated) - Add product to wishlist
- `DELETE /api/v1/wishlist/items/:productId` (Authenticated) - Remove product from wishlist

#### 4. Checkout & Orders (`/api/v1/orders`)
- `POST /api/v1/orders` (Authenticated/Guest) - Place new order (atomic stock reservation, snapshot addresses & items, calculate amounts)
- `GET /api/v1/orders` (Authenticated) - List user orders (paginated)
- `GET /api/v1/orders/:orderNumber` (Authenticated/Guest Token) - Get order details, tracking status, items
- `POST /api/v1/orders/:id/cancel` (Authenticated) - Cancel pending order & release inventory reservation

#### 5. Payments & Invoices (`/api/v1/payments`, `/api/v1/invoices`)
- `POST /api/v1/payments/create-intent` (Authenticated) - Initialize payment intent (Stripe / Razorpay)
- `POST /api/v1/payments/webhook` (Public) - Payment gateway webhook listener
- `GET /api/v1/invoices/:orderId` (Authenticated) - Retrieve invoice for order

#### 6. Reviews & Marketing (`/api/v1/reviews`, `/api/v1/coupons`)
- `GET /api/v1/products/:productId/reviews` (Public) - List published product reviews
- `POST /api/v1/reviews` (Authenticated) - Submit product review (verified purchase check)
- `POST /api/v1/coupons/validate` (Public/Auth) - Validate coupon code for cart subtotal

#### 7. Returns & Refunds (`/api/v1/returns`)
- `POST /api/v1/returns` (Authenticated) - Request order item return
- `GET /api/v1/returns` (Authenticated) - List user return requests

#### 8. Administrative Management (`/api/v1/admin/*`)
- `POST /api/v1/admin/products` (Admin) - Create product
- `PUT /api/v1/admin/products/:id` (Admin) - Update product
- `DELETE /api/v1/admin/products/:id` (Admin) - Soft delete product
- `PATCH /api/v1/admin/orders/:id/status` (Admin) - Update order status
- `POST /api/v1/admin/shipments` (Admin) - Create shipment & tracking number
- `PATCH /api/v1/admin/inventory/:variantId` (Admin) - Adjust inventory levels
- `GET /api/v1/admin/audit-logs` (Admin) - View system audit logs

---

## 6. Runtime Input Validation Rules (Zod)

All incoming request parameters MUST be strictly validated at runtime using Zod schemas:

1. **Pagination Query Schema**:
   - `page`: Int >= 1 (Default: 1)
   - `limit`: Int between 1 and 100 (Default: 20)
2. **Product Filter Query Schema**:
   - `minPrice`: Optional Decimal >= 0
   - `maxPrice`: Optional Decimal >= minPrice
   - `search`: Optional string (max 100 chars, sanitized)
   - `sortBy`: Enum (`createdAt`, `price`, `name`, `sortOrder`)
   - `sortOrder`: Enum (`asc`, `desc`)
3. **Cart Item Schema**:
   - `variantId`: UUID format
   - `quantity`: Int >= 1
4. **Order Creation Schema**:
   - `items`: Array of `{ variantId: UUID, quantity: Int >= 1 }`
   - `shippingAddress`: Object with required fields (`firstName`, `addressLine1`, `city`, `state`, `postalCode`, `countryCode`)
   - `billingAddress`: Optional Object matching address schema

---

## 7. Business Rules & Transactional Boundaries

The service layer MUST wrap the following multi-table operations inside `prisma.$transaction`:

1. **Order Creation (`OrderService.createOrder`)**:
   - Verify stock availability (`quantity_on_hand - quantity_reserved >= requestedQuantity`).
   - Increment `inventories.quantity_reserved`.
   - Create `inventory_reservations` record with expiration timestamp (e.g. 15 minutes).
   - Create `Order` record with unique `order_number`.
   - Create `OrderAddress` (shipping & billing snapshot).
   - Create `OrderItem` records (snapshot `unit_price`, `sku`, `product_name`, `variant_name`).
   - If coupon applied, record `coupon_usages` and increment `coupons.used_count`.

2. **Payment Success Processing (`PaymentService.handlePaymentSuccess`)**:
   - Update `Payment` status to `CAPTURED`.
   - Create `PaymentTransaction` of type `CAPTURE`.
   - Update `Order` status to `CONFIRMED`.
   - Record `OrderStatusHistory` entry (`old_status: PENDING`, `new_status: CONFIRMED`).
   - Deduct `quantity_on_hand` and `quantity_reserved` in `inventories`.
   - Create `InventoryMovement` of type `SALE`.
   - Generate `Invoice` record.

3. **Order Cancellation (`OrderService.cancelOrder`)**:
   - Update `Order` status to `CANCELLED`.
   - Release `inventory_reservations`.
   - Decrement `inventories.quantity_reserved`.
   - Record `OrderStatusHistory` entry.

---

## 8. Error Handling & Security Architecture

### Error Code Mapping

| Exception Type | HTTP Status | Error Code | Description |
|---|---|---|---|
| `ZodError` | 400 Bad Request | `VALIDATION_ERROR` | Invalid input payload or query params |
| `UnauthorizedError` | 401 Unauthorized | `UNAUTHORIZED` | Missing or invalid auth token |
| `ForbiddenError` | 403 Forbidden | `FORBIDDEN` | Insufficient permissions or account suspended |
| `NotFoundError` | 404 Not Found | `NOT_FOUND` | Requested entity does not exist |
| `ConflictError` | 409 Conflict | `RESOURCE_CONFLICT` | Unique constraint violation (e.g., email or SKU taken) |
| `UnprocessableEntityError` | 422 Unprocessable | `INSUFFICIENT_STOCK` | Stock unavailable or invalid state transition |
| `InternalServerError` | 500 Internal Error | `INTERNAL_SERVER_ERROR` | Unexpected server failure |

### Security Measures
- **Helmet**: Set secure HTTP response headers.
- **Rate Limiting**: `express-rate-limit` configured on `/api/v1/auth/*` (max 10 requests per minute per IP) and global endpoints (max 100 requests per minute).
- **CORS**: Restricted strictly to `process.env.CORS_ORIGIN`.
- **Payload Limits**: `express.json({ limit: "2mb" })`.

---

## 9. Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 100% of API endpoints derive strictly from models in [`schema.prisma`](file:///d:/CS-Next/backend/prisma/schema.prisma) without adding unauthorized DB fields or models.
- **SC-002**: 100% of endpoints respond using the unified `{ success: true, data: ... }` / `{ success: false, error: ... }` envelope format.
- **SC-003**: 0 raw database errors or internal stack traces exposed in API error responses.
- **SC-004**: All multi-table write operations (Order Creation, Payment Capture, Order Cancellation) maintain 100% atomicity via Prisma transactions.
- **SC-005**: 100% of input parameters (body, query, params) validated at runtime via Zod schemas.

---

## 10. Assumptions

- PostgreSQL database and Prisma Client are already fully operational and synchronized.
- Authentication utilizes Firebase Admin SDK (`firebase-admin`) with fallback JWT signing using `JWT_SECRET` defined in `backend/.env`.
- API endpoints will be served at base path `/api/v1` from Express application configured in `backend/src/app.ts`.
