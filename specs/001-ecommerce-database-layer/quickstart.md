# Quickstart & Database Verification Guide

This document provides step-by-step commands to validate and verify the complete e-commerce database layer implementation end-to-end.

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL 16+ running locally or accessible via `DATABASE_URL` in `backend/.env`
- Dependencies installed in `backend/`

---

## Execution Steps

### 1. Validate Prisma Schema Syntax
Validate that `backend/prisma/schema.prisma` is syntactically valid and compiles with Prisma CLI.

```bash
cd backend
npx prisma validate
```

### 2. Format Prisma Schema
Format the `.prisma` file according to standard Prisma conventions.

```bash
cd backend
npx prisma format
```

### 3. Create & Apply Initial Migration
Create the initial PostgreSQL database migration and apply it to your database.

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client
Generate the type-safe Prisma Client package.

```bash
cd backend
npx prisma generate
```

### 5. Seed Initial System Data
Seed initial roles (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`) and base clothing attributes into PostgreSQL.

```bash
cd backend
npx prisma db seed
```

### 6. Run Database Verification Script
Execute the database verification script to empirically test database CRUD, relationships, decimal precision, foreign key cascades, and soft deletion.

```bash
cd backend
npx ts-node src/scripts/verify-db.ts
```

---

## Expected Verification Outcomes

1. `npx prisma validate` returns `The schema at prisma/schema.prisma is valid.`
2. Migration succeeds creating 48 tables and 16 enums in PostgreSQL.
3. Seeding inserts 3 roles and 9 attributes without error.
4. `verify-db.ts` exits with code 0 and logs `ALL DATABASE VERIFICATION TESTS PASSED`.
