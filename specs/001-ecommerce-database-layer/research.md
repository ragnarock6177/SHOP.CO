# Research: E-Commerce Database Layer Implementation

## Decision Log & Technology Mapping

### 1. Database ORM & Client Choice
- **Decision**: Prisma ORM with `@prisma/client` PostgreSQL provider.
- **Rationale**: Prisma is pre-installed in `backend/package.json` and supports declarative model definitions, migrations via `prisma migrate dev`, and typed query builder API.
- **Alternatives Considered**: Direct SQL with `pg` (lacks type safety), TypeORM/Sequelize (heavier abstraction, not configured in repo).

### 2. PostgreSQL Custom Types & Extension Mapping in Prisma
- **Decision**:
  - **UUID**: Mapped to `String @id @default(uuid()) @db.Uuid`.
  - **CITEXT (Case-Insensitive Text)**: Mapped to `String @db.Citext` for `users.email` and `orders.customer_email`.
  - **NUMERIC(19,4)**: Mapped to Prisma `Decimal @db.Decimal(19, 4)` for all currency/monetary fields.
  - **INET**: Mapped to `String @db.Inet` for `audit_logs.ip_address`.
  - **CHAR(2) / CHAR(3)**: Mapped to `String @db.Char(2)` / `@db.Char(3)` for ISO codes.
  - **JSONB**: Mapped to `Json` for metadata and audit diff logs.
- **Rationale**: Ensures exact physical column typing in PostgreSQL while preserving decimal arithmetic safety in TypeScript.

### 3. Firebase Authentication Integration on `User` Model
- **Decision**: Add an optional `firebase_uid` field (`firebaseUid String? @unique @map("firebase_uid") @db.VarChar(128)`) and optional `profile_image` (`profileImage String? @map("profile_image")`) to `User` table while keeping all `DATABASE_DESIGN.md` fields (`password_hash`, `email_verified_at`, `status`, RBAC relations).
- **Rationale**: Enables seamless mapping between Firebase Auth tokens and PostgreSQL user records without breaking existing `DATABASE_DESIGN.md` schema or RBAC architecture.

### 4. Indexing & Constraint Strategy
- **Decision**: Map all single-column and multi-column indexes using Prisma `@@index([fields...], map: "idx_...")` and unique constraints using `@unique` or `@@unique([...], map: "uq_...")`.
- **Rationale**: Keeps database lookups fast for status queries, lookup by SKU, lookup by tracking number, user addresses, order history, and category lookups.

### 5. Referential Integrity & Deletion Actions
- **Decision**:
  - `onDelete: Cascade` for dependent child records (addresses, images, items, junction tables).
  - `onDelete: Restrict` for core entity relations where historical record keeping is required (cart items -> variant, order items -> order, category -> subcategory).
  - `onDelete: SetNull` for optional audit/user links (orders -> user, reviews -> user/variant/order_item).
- **Rationale**: Directly reflects referential constraints established in `DATABASE_DESIGN.md`.

### 6. Seeding Strategy
- **Decision**: Create `backend/prisma/seed.ts` using `@prisma/client` to seed standard roles (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`) and base clothing attributes (`Color`, `Size`, `Fabric`, `Fit`, `Pattern`, `Neck Type`, `Sleeve Type`, `Age Group`, `Waist`) idempotently (`upsert`).
- **Rationale**: Guarantees necessary operational lookup data is loaded automatically after database migrations.

### 7. Automated Database Verification Strategy
- **Decision**: Create a dedicated TypeScript verification script `backend/src/scripts/verify-db.ts` that tests connection, queries schema metadata, tests transactional operations across core tables (User, Product, ProductVariant, Inventory, Cart, Order), and verifies soft delete filters.
- **Rationale**: Guarantees empirical runtime verification without requiring API endpoints or frontend setup.
