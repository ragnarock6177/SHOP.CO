# Implementation Plan: E-Commerce Database Layer Implementation

**Branch**: `001-ecommerce-database-layer` | **Date**: 2026-08-18 | **Spec**: [`spec.md`](file:///d:/CS-Next/specs/001-ecommerce-database-layer/spec.md)

**Input**: Feature specification from [`/specs/001-ecommerce-database-layer/spec.md`](file:///d:/CS-Next/specs/001-ecommerce-database-layer/spec.md)

---

## Summary

Implement the complete, finalized e-commerce database architecture using Prisma ORM and PostgreSQL 16+ as defined in [`DATABASE_DESIGN.md`](file:///d:/CS-Next/backend/DATABASE_DESIGN.md). Replace the temporary 8-model placeholder schema in `backend/prisma/schema.prisma` with all 48 models, 16 enums, dynamic variant attributes, inventory reservations, carts, orders, shipments, payments, invoices, returns, refunds, audit logs, and seed data.

---

## Technical Context

- **Language/Version**: Node.js v18+ / TypeScript 5.x
- **Primary Dependencies**: `@prisma/client` ^5.22.0, `prisma` ^5.22.0
- **Storage**: PostgreSQL 16+ (with `pgcrypto` and `citext` extensions)
- **Testing / Verification**: Prisma validate, migration check, seed execution, TypeScript DB integration verification script (`src/scripts/verify-db.ts`)
- **Target Platform**: Node.js backend runtime on Linux/Windows/macOS
- **Project Type**: Web Application Database Layer (Backend API persistence)
- **Performance Goals**: Efficient lookup on indexed fields (`status`, `slug`, `sku`, `user_id`, `order_id`, `created_at`), exact decimal accuracy for monetary calculations
- **Constraints**: No database redesign; source of truth is `DATABASE_DESIGN.md`; preserve existing Node.js/TypeScript/PostgreSQL setup; extend User model for Firebase Auth (`firebase_uid`).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **No Unnecessary Architecture**: Plan uses standard Prisma schema and PostgreSQL migrations without extra ORM frameworks or direct SQL query builder bloat.
- [x] **Preserve Source of Truth**: `DATABASE_DESIGN.md` rules, structures, enums, names, and relationships are preserved 100%.
- [x] **Strict Verification**: Includes automated database integration verification script to validate model CRUD and referential integrity before completing.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-ecommerce-database-layer/
├── plan.md              # Implementation plan
├── research.md          # Technology mapping and decision log
├── data-model.md        # Detailed entity and enum specifications
├── quickstart.md        # Runnable verification guide
├── contracts/           # Database layer boundary contract
│   └── db-schema-contract.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   ├── schema.prisma   # Finalized 48-model Prisma schema
│   ├── seed.ts         # Idempotent seed script (Roles & Attributes)
│   └── migrations/     # Generated PostgreSQL DDL migrations
├── src/
│   ├── lib/
│   │   └── prisma.ts   # Singleton PrismaClient export
│   └── scripts/
│       └── verify-db.ts # Automated runtime database test script
├── package.json
└── tsconfig.json
```

**Structure Decision**: Web application backend structure using standard `backend/prisma/` conventions.

---

## Detailed Implementation Phases

### Phase 1: Review Existing Configuration & Clean Slate
1. Review `backend/package.json` dependencies and `backend/prisma/schema.prisma`.
2. Ensure Prisma database connection settings (`url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`) are retained.

### Phase 2: Schema Implementation (48 Models & 16 Enums)
1. Write 16 Enums in `backend/prisma/schema.prisma`:
   - `UserStatus`, `ProductStatus`, `ProductVisibility`, `CategoryStatus`, `CartStatus`, `OrderStatus`, `PaymentStatus`, `PaymentTransactionType`, `InvoiceStatus`, `ShipmentStatus`, `InventoryMovementType`, `AddressType`, `DiscountType`, `ReturnStatus`, `ReturnReason`, `RefundStatus`.
2. Write Core User & RBAC Models:
   - `User` (with `firebase_uid` @unique for Firebase Auth), `Role`, `Permission`, `UserRole`, `RolePermission`, `UserAddress`.
3. Write Catalog & Variant Models:
   - `Collection`, `Category`, `CollectionCategory`, `Product`, `ProductCategory`, `ProductCollection`, `ProductImage`, `ProductVideo`, `Attribute`, `AttributeValue`, `ProductAttributeValue`, `ProductVariant`, `VariantAttributeValue`, `VariantImage`, `PriceHistory`.
4. Write Inventory Models:
   - `Inventory`, `InventoryMovement`, `InventoryReservation`.
5. Write Wishlist & Cart Models:
   - `Wishlist`, `WishlistItem`, `Cart`, `CartItem`.
6. Write Order & Fulfillment Models:
   - `Order`, `OrderAddress`, `OrderItem`, `OrderStatusHistory`, `Shipment`, `ShipmentItem`, `ShipmentStatusHistory`.
7. Write Payment & Billing Models:
   - `Payment`, `PaymentTransaction`, `Invoice`.
8. Write Marketing, Returns & Audit Models:
   - `ProductReview`, `ReviewImage`, `Coupon`, `CouponProduct`, `CouponCategory`, `CouponUsage`, `Return`, `ReturnItem`, `Refund`, `AuditLog`.
9. Apply Native PostgreSQL Types & Constraints:
   - `@db.Decimal(19, 4)` on all monetary fields.
   - `@db.Citext` on case-insensitive email fields.
   - `@db.Char(2)` / `@db.Char(3)` on country and currency codes.
   - `@db.Inet` on `ip_address`.
   - `@@index`, `@@unique`, `@default(uuid())`, `@default(now())`, `@updatedAt`.
   - `onDelete: Cascade`, `onDelete: Restrict`, `onDelete: SetNull`.

### Phase 3: Migration & Client Generation
1. Validate schema using `npx prisma validate`.
2. Format schema using `npx prisma format`.
3. Generate Prisma Client using `npx prisma generate`.
4. Create and apply initial migration to PostgreSQL using `npx prisma migrate dev --name init`.

### Phase 4: Database Seeding & Verification
1. Configure `prisma.seed` command in `backend/package.json` pointing to `ts-node prisma/seed.ts`.
2. Create `backend/prisma/seed.ts` to populate initial seed roles (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`) and base attributes (`Color`, `Size`, `Fabric`, `Fit`, `Pattern`, `Neck Type`, `Sleeve Type`, `Age Group`, `Waist`).
3. Run `npx prisma db seed`.
4. Create `backend/src/scripts/verify-db.ts` to execute automated integration tests against the database.
5. Execute `npx ts-node src/scripts/verify-db.ts` and confirm clean verification exit.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | All structures strictly match `DATABASE_DESIGN.md` | N/A |
