# Research: Production-Ready REST API Layer

## Decision Log & Technology Mapping

### 1. Framework & Runtime Engine
- **Decision**: Express.js 4.21 with Node.js ESM modules (`"type": "module"`) and TypeScript 5.7.
- **Rationale**: Express is pre-configured in `backend/package.json` (`express ^4.21.2`, `cors ^2.8.5`, `helmet ^8.0.0`).
- **Alternatives Considered**: Fastify/NestJS (would require modifying working infrastructure, unnecessary overhead).

### 2. Runtime Request Validation
- **Decision**: Zod (`zod ^4.4.3`) middleware for runtime validation of `req.body`, `req.query`, and `req.params`.
- **Rationale**: Zod provides type inference directly into TypeScript interfaces and strips unknown or malicious input keys.
- **Alternatives Considered**: Joi / express-validator (Zod is pre-installed in `package.json`).

### 3. Authentication & RBAC Strategy
- **Decision**:
  - `firebase-admin` SDK to verify Bearer ID Tokens from Firebase Auth.
  - Fallback JWT verification using `jsonwebtoken` with `process.env.JWT_SECRET`.
  - Attaches `req.user` (`{ id, email, role, status }`) to Express Request context.
  - RBAC middleware querying `UserRole` -> `Role` -> `Permission` and checking `User.status === 'ACTIVE'`.
- **Rationale**: Reuses installed `firebase-admin` and `jsonwebtoken` packages, matching `User.firebaseUid` in PostgreSQL.

### 4. Data Access & Query Optimization
- **Decision**: Direct usage of Prisma Client singleton in service layer (`src/lib/prisma.ts`).
- **Rationale**: Avoids creating a redundant DAO/Repository layer over Prisma, keeping controllers lean and business logic encapsulated in services. Explicit Prisma `select` clauses prevent sensitive data leaks (`passwordHash`, internal tokens).

### 5. Multi-Table Transaction Management
- **Decision**: Prisma Interactive Transactions (`prisma.$transaction(async (tx) => { ... })`).
- **Rationale**: Guarantees strict ACID atomicity for multi-table writes (Order placement, stock reservation, payment capture, order cancellation).

### 6. Error Handling & API Response Envelope
- **Decision**: Centralized error middleware (`src/middleware/errorHandler.ts`) mapping custom `ApiError` subclasses (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`) into unified JSON response envelopes:
  - `{ success: true, data: ..., message?: string, meta?: ... }`
  - `{ success: false, error: { code: string, message: string, details?: ... } }`
- **Rationale**: Ensures zero raw stack traces or database errors leak to clients.
