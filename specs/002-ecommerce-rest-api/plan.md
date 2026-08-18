# Implementation Plan: Production-Ready REST API Layer

**Branch**: `002-ecommerce-rest-api` | **Date**: 2026-08-18 | **Spec**: [`spec.md`](file:///d:/CS-Next/specs/002-ecommerce-rest-api/spec.md)

**Input**: Feature specification from [`/specs/002-ecommerce-rest-api/spec.md`](file:///d:/CS-Next/specs/002-ecommerce-rest-api/spec.md)

---

## Summary

Build a production-ready, 5-tier REST API layer (`Route` -> `Middleware` -> `Controller` -> `Service` -> `Prisma Client`) on top of the existing 48-model PostgreSQL database schema (`backend/prisma/schema.prisma`). Implement Firebase & JWT authentication, RBAC authorization, runtime Zod validation, standardized response envelopes (`{ success: true, data: ... }`), Prisma interactive transactions for multi-table writes (Orders, Stock Reservations, Payments), centralized error handling, and unit/integration testing.

---

## Technical Context

- **Language/Version**: Node.js v18+ / TypeScript 5.7 (`"type": "module"`)
- **Framework & Libraries**: Express 4.21, Zod 4.4, Firebase Admin 14.2, JsonWebToken 9.0, Helmet 8.0, CORS 2.8, Morgan 1.10, Rate Limit 8.6, `@prisma/client` 6.19
- **Storage**: PostgreSQL 16+ via Prisma ORM (`backend/src/lib/prisma.ts`)
- **Testing**: Jest / Supertest API integration tests
- **Target Platform**: Node.js backend server (`backend/src/server.ts`)
- **Project Type**: Web Application REST API
- **Performance Goals**: Sub-100ms API response time for cached/indexed catalog queries, zero floating-point rounding bugs, strict ACID transaction isolation.
- **Constraints**: Do NOT alter database schema; source of truth is `schema.prisma`; keep controllers free of Prisma queries; exclude sensitive fields (`passwordHash`).

---

## Constitution Check

- [x] **No Redundant Abstractions**: Uses existing Express & Prisma infrastructure without introducing extra ORM wrappers.
- [x] **Layer Decoupling**: Controllers handle HTTP format; Services handle business logic & transactions; Routes attach middleware.
- [x] **Strict Verification**: Includes automated Supertest / Integration test suites for every API module.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-ecommerce-rest-api/
├── plan.md              # Implementation plan
├── research.md          # Technology mapping and decision log
├── data-model.md        # API DTO and Zod validation schemas
├── quickstart.md        # Runnable API test guide
├── contracts/           # Endpoint & Service contracts
│   └── api-contracts.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/src/
├── app.ts               # Express application configuration
├── server.ts            # Server entrypoint
├── config/              # Environment variables & Firebase Admin initialization
│   ├── env.ts
│   └── firebase.ts
├── lib/
│   └── prisma.ts        # Singleton PrismaClient export
├── middleware/          # Cross-cutting middleware
│   ├── auth.ts          # Firebase ID Token & JWT verification
│   ├── rbac.ts          # Role & permission authorization
│   ├── validate.ts      # Zod runtime validator
│   ├── rateLimiter.ts   # Express rate limiter
│   └── errorHandler.ts  # Centralized error handler
├── utils/               # Response formatters & Custom Error classes
│   ├── response.ts      # Standardized JSON response envelope helpers
│   ├── errors.ts        # ApiError, ValidationError, NotFoundError, etc.
│   └── pagination.ts    # Pagination calculation helpers
├── validators/          # Zod validation schemas
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   ├── catalog.validator.ts
│   ├── cart.validator.ts
│   ├── order.validator.ts
│   └── admin.validator.ts
├── controllers/         # HTTP request extractors & response senders
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── catalog.controller.ts
│   ├── cart.controller.ts
│   ├── order.controller.ts
│   ├── payment.controller.ts
│   ├── review.controller.ts
│   └── admin.controller.ts
├── services/            # Business logic & Prisma transactions
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── catalog.service.ts
│   ├── cart.service.service.ts
│   ├── order.service.ts
│   ├── payment.service.ts
│   ├── review.service.ts
│   └── admin.service.ts
└── routes/              # Express API routers
    ├── index.ts         # Main /api/v1 router
    ├── auth.routes.ts
    ├── users.routes.ts
    ├── catalog.routes.ts
    ├── cart.routes.ts
    ├── orders.routes.ts
    ├── payments.routes.ts
    └── admin.routes.ts
```

---

## Detailed 10-Phase Implementation Plan

### Phase 1: Backend/API Foundation & Infrastructure
- [ ] Implement custom error hierarchy in `backend/src/utils/errors.ts` (`ApiError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `UnprocessableError`).
- [ ] Implement standardized response helpers in `backend/src/utils/response.ts` (`sendSuccess`, `sendPaginated`, `sendError`).
- [ ] Implement pagination & query parsing helper in `backend/src/utils/pagination.ts`.
- [ ] Refactor centralized error middleware in `backend/src/middleware/errorHandler.ts` to map Zod errors and custom `ApiError` instances to standardized HTTP responses.
- [ ] Implement rate limiting middleware in `backend/src/middleware/rateLimiter.ts` using `express-rate-limit`.
- [ ] Add 404 Not Found route handler for unmatched routes in `backend/src/app.ts`.

### Phase 2: Authentication & Authorization Middleware
- [ ] Initialize Firebase Admin SDK in `backend/src/config/firebase.ts`.
- [ ] Implement authentication middleware in `backend/src/middleware/auth.ts` to verify Firebase ID Tokens or JWT tokens and attach `req.user`.
- [ ] Implement RBAC authorization middleware in `backend/src/middleware/rbac.ts` (`requireRole`, `requirePermission`) checking `UserRole` -> `Role` -> `Permission` and `User.status === 'ACTIVE'`.
- [ ] Implement User Ownership guard middleware in `backend/src/middleware/ownership.ts` (`requireOwnership`).

### Phase 3: User-Owned Resources (`/api/v1/auth`, `/api/v1/users`)
- [ ] Implement Zod validators in `backend/src/validators/auth.validator.ts` & `user.validator.ts`.
- [ ] Implement `AuthService` & `UserService` in `backend/src/services/`.
- [ ] Implement `AuthController` & `UserController` in `backend/src/controllers/`.
- [ ] Wire `/api/v1/auth` and `/api/v1/users` routes in `backend/src/routes/`.
- [ ] Add integration tests in `backend/tests/integration/auth.test.ts`.

### Phase 4: Public Catalog & Taxonomy Resources (`/api/v1/collections`, `/api/v1/categories`, `/api/v1/products`)
- [ ] Implement Zod validators in `backend/src/validators/catalog.validator.ts`.
- [ ] Implement `CatalogService` & `ProductService` in `backend/src/services/` (filtering, price sorting, variant inclusion, stock calculation).
- [ ] Implement `CatalogController` & `ProductController` in `backend/src/controllers/`.
- [ ] Wire `/api/v1/collections`, `/api/v1/categories`, and `/api/v1/products` routes in `backend/src/routes/`.
- [ ] Add integration tests in `backend/tests/integration/catalog.test.ts`.

### Phase 5: Shopping Resources (`/api/v1/cart`, `/api/v1/wishlist`, `/api/v1/coupons`, `/api/v1/reviews`)
- [ ] Implement Zod validators in `backend/src/validators/cart.validator.ts` & `review.validator.ts`.
- [ ] Implement `CartService` (guest token cart creation, cart item updates, guest-to-user cart merging) and `WishlistService` in `backend/src/services/`.
- [ ] Implement `CartController`, `WishlistController`, `CouponController`, `ReviewController` in `backend/src/controllers/`.
- [ ] Wire `/api/v1/cart`, `/api/v1/wishlist`, `/api/v1/coupons`, `/api/v1/reviews` routes in `backend/src/routes/`.
- [ ] Add integration tests in `backend/tests/integration/cart.test.ts`.

### Phase 6: Transaction-Heavy Resources (`/api/v1/orders`, `/api/v1/payments`, `/api/v1/invoices`, `/api/v1/returns`)
- [ ] Implement Zod validators in `backend/src/validators/order.validator.ts`.
- [ ] Implement `OrderService` inside `prisma.$transaction` (atomic inventory reservation, order creation, item & address snapshotting).
- [ ] Implement `PaymentService` inside `prisma.$transaction` (payment intent creation, webhook capture handling, invoice generation).
- [ ] Implement `ReturnService` & `RefundService` in `backend/src/services/`.
- [ ] Implement `OrderController`, `PaymentController`, `InvoiceController`, `ReturnController` in `backend/src/controllers/`.
- [ ] Wire `/api/v1/orders`, `/api/v1/payments`, `/api/v1/invoices`, `/api/v1/returns` routes in `backend/src/routes/`.
- [ ] Add integration tests in `backend/tests/integration/orders.test.ts`.

### Phase 7: Administrative Resources (`/api/v1/admin/*`)
- [ ] Implement Zod validators in `backend/src/validators/admin.validator.ts`.
- [ ] Implement `AdminProductService`, `AdminOrderService`, `AdminShipmentService`, `AdminInventoryService`, `AdminAuditService` in `backend/src/services/`.
- [ ] Implement `AdminController` in `backend/src/controllers/`.
- [ ] Wire `/api/v1/admin/*` routes with `authMiddleware` and `requireRole(['ADMIN', 'SUPER_ADMIN'])`.
- [ ] Add integration tests in `backend/tests/integration/admin.test.ts`.

### Phase 8: Cross-Cutting Security & Hardening
- [ ] Enforce Helmet HTTP headers and CORS origin restrictions in `backend/src/app.ts`.
- [ ] Apply rate limiting on `/api/v1/auth/*` (10 req/min) and global endpoints (100 req/min).
- [ ] Verify sensitive field exclusion (`passwordHash`) across all services.

### Phase 9: Comprehensive API Integration Testing
- [ ] Run full test suite using Jest / Supertest.
- [ ] Verify HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500`).

### Phase 10: API Documentation (OpenAPI / Swagger)
- [ ] Generate OpenAPI 3.0 specification file `backend/docs/openapi.yaml` documenting all `/api/v1` routes, schemas, and response contracts.
