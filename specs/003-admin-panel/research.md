# Phase 0 Research & Technical Decisions: AIRAVÉ Admin Panel

**Feature**: Admin Panel Specification & Plan  
**Branch**: `003-admin-panel`  
**Date**: 2026-08-19

---

## 1. Research Topic: Granular RBAC Permission Checking Strategy

### Decision
Implement permission verification middleware (`requirePermission('domain:action')`) that resolves role permissions dynamically using the existing `users` → `user_roles` → `roles` → `role_permissions` → `permissions` model chain, with in-memory request-level caching.

### Rationale
- Strictly aligns with the existing PostgreSQL schema defined in `backend/DATABASE_DESIGN.md`.
- Prevents privilege escalation by verifying exact permission string grants (e.g. `products:create`, `orders:update_status`, `refunds:process`).
- Decouples API endpoints from hardcoded role names (`ADMIN`, `MANAGER`, etc.), making role creation fully configurable by `SUPER_ADMIN` users.

### Alternatives Considered
- *Hardcoding role names in endpoint middleware (`requireRole(['ADMIN'])`)*: Rejected because business operations require fine-grained privileges (e.g. an Inventory Manager shouldn't issue refunds).

---

## 2. Research Topic: Inventory Concurrency & Transactional Integrity

### Decision
Use Prisma Interactive Transactions (`prisma.$transaction(async (tx) => { ... })`) combined with explicit stock delta arithmetic for all inventory adjustments and movements.

### Rationale
- Guarantees that `available_quantity = quantity_on_hand - quantity_reserved` remains valid under concurrent updates.
- Ensures an `inventory_movements` log entry is atomically committed alongside `inventories.quantity_on_hand` mutation.
- Guarantees rollback if either inventory update or movement logging fails.

### Alternatives Considered
- *Non-transactional simple updates*: Rejected due to high risk of race conditions and missing movement audit logs.

---

## 3. Research Topic: Order & Fulfillment State Machine Validation

### Decision
Implement a centralized State Machine validator module (`validateOrderTransition(currentStatus, targetStatus)`) enforced in order services before initiating status mutations or history inserts.

### Rationale
- Enforces strict transition rules defined in `backend/DATABASE_DESIGN.md` (e.g., `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
- Prevents impossible or invalid state jumps (e.g., jumping from `DELIVERED` back to `PENDING`).
- Ensures an `order_status_history` record is created on every valid transition.

---

## 4. Research Topic: Server-Side Query Sanitization & Filtering Architecture

### Decision
Create a centralized query builder helper (`parseAdminQueryParams`) using Zod schema validation to parse, sanitize, and map incoming client search parameters to Prisma query clauses.

### Rationale
- Prevents arbitrary JSON clause injection or un-whitelisted column ordering.
- Standardizes pagination payload structure across all 20+ admin endpoints:
  ```json
  {
    "data": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
  ```

---

## 5. Research Topic: Immutable Audit Logging Integration

### Decision
Implement `AuditService.logAction(tx, userId, entityType, entityId, action, oldValues, newValues)` called within business service transactions.

### Rationale
- Guarantees sensitive administrative actions (price overrides, manual stock shifts, user status blocks, refunds) are logged with IP address, user agent, and timestamp.
- Audit records in `audit_logs` are strictly read-only with no update/delete APIs exposed.
