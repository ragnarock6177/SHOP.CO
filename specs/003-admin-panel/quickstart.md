# Quickstart Validation & Verification Guide: AIRAVÉ Admin Panel

**Feature**: Admin Panel Specification & Plan  
**Branch**: `003-admin-panel`  
**Date**: 2026-08-19

---

## 1. Prerequisites

- **Node.js**: v20.x or higher
- **Database**: PostgreSQL 16+ running and connected via `.env` (`DATABASE_URL`)
- **Prisma Client**: Generated via `npx prisma generate` in `backend/`

---

## 2. Validation Scenarios

### Scenario A: Authentication & RBAC Verification
1. Attempt `GET /api/v1/admin/dashboard` without `Authorization` header.  
   *Expected Result*: HTTP `401 Unauthorized`.
2. Login as a user with `CUSTOMER` role and attempt `GET /api/v1/admin/products`.  
   *Expected Result*: HTTP `403 Forbidden`.
3. Login as a user with `ADMIN` role and `products:read` permission.  
   *Expected Result*: HTTP `200 OK` returning structured product list JSON.

### Scenario B: Transactional Stock Adjustment
1. Select a variant SKU (e.g. `TSHIRT-BLK-L`) with `quantity_on_hand = 50`.
2. Send `POST /api/v1/admin/inventory/adjust` with payload:
   ```json
   {
     "variant_id": "<variant-uuid>",
     "quantity_change": -5,
     "movement_type": "DAMAGE",
     "notes": "Torn fabric during stock inspection"
   }
   ```
3. Inspect response: HTTP `200 OK`.
4. Verify database: `quantity_on_hand` is now `45`. An `inventory_movements` record exists with `movement_type = 'DAMAGE'` and `quantity_change = -5`.

### Scenario C: Order Status State Machine Transition
1. Identify an order in `CONFIRMED` status.
2. Send `PATCH /api/v1/admin/orders/:id/status` with `new_status = "PROCESSING"`.  
   *Expected Result*: HTTP `200 OK`. Order status becomes `PROCESSING`. Row added to `order_status_history`.
3. Send `PATCH /api/v1/admin/orders/:id/status` with invalid `new_status = "PENDING"`.  
   *Expected Result*: HTTP `400 Bad Request` ("Invalid status transition from PROCESSING to PENDING").

### Scenario D: Audit Log Recording
1. Update a product price via `PUT /api/v1/admin/products/:id`.
2. Send `GET /api/v1/admin/audit-logs?entity_type=Product`.  
   *Expected Result*: Returns immutable audit log record detailing `old_values` (old price) and `new_values` (new price) with actor `user_id`.
