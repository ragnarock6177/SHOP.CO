# Quickstart & Verification Guide: Admin Panel Frontend

**Feature**: Admin Panel Frontend (`specs/004-admin-panel-frontend`)  
**Date**: 2026-08-19

## Prerequisites

1. Node.js v18+ installed on system.
2. PostgreSQL database and backend service running locally on `http://localhost:5000`.
3. Admin Next.js application workspace located in `admin/`.

---

## Runnable Verification Scenarios

### Scenario 1: Admin Authentication & Guarded Redirection
1. **Start Admin Dev Server**:
   ```bash
   cd admin
   npm run dev
   ```
2. **Access Unauthenticated Route**: Open browser to `http://localhost:3001/dashboard`.
3. **Expected Outcome**: Page automatically redirects to `http://localhost:3001/login?redirect=/dashboard`.
4. **Log In**: Enter valid admin credentials (`admin@airave.com` / `Password123!`) and click "Log In".
5. **Expected Outcome**: Token is stored in `AuthContext`, user is redirected to `/dashboard`, and header displays staff initials and role badge.

---

### Scenario 2: Executive Dashboard Metrics Verification
1. Open `http://localhost:3001/dashboard`.
2. Verify KPI cards display Gross Revenue, Orders Count, Low-Stock Count, and Pending Returns.
3. Change date range filter selector to `Last 30 Days`.
4. **Expected Outcome**: React Query dispatches `GET /api/v1/admin/dashboard?fromDate=...&toDate=...` and updates KPI metrics seamlessly without full page refresh.

---

### Scenario 3: Inventory Stock Adjustment Business Modal
1. Navigate to `http://localhost:3001/inventory`.
2. Locate a product variant in the table and click the **"Adjust Stock"** action button.
3. In the modal:
   - Select Movement Type: `PURCHASE`.
   - Enter Quantity Change: `+25`.
   - Enter Notes: `Restock shipment received`.
4. Click **"Submit Adjustment"**.
5. **Expected Outcome**: Modal submits `POST /api/v1/admin/inventory/adjust`, Sonner toast displays success notification ("Stock adjusted successfully"), table row updates available quantity, and new movement record appears on `/inventory/movements`.

---

### Scenario 4: Order Status State Machine Transition
1. Navigate to `http://localhost:3001/orders`.
2. Click an order currently in `CONFIRMED` status.
3. On `/orders/[id]`, click the Status Shift dropdown button.
4. **Expected Outcome**: Dropdown displays ONLY allowed transitions (`PROCESSING`, `CANCELLED`). Illegal transitions (e.g. `DELIVERED`, `PENDING`) are absent.
5. Select `PROCESSING`.
6. **Expected Outcome**: Order status badge updates to `PROCESSING`, status timeline stream appends new entry with timestamp and staff user name.

---

### Scenario 5: System Audit Logs & Sensitive Payload Redaction
1. Navigate to `http://localhost:3001/audit-logs`.
2. Locate a recent audit log entry and click **"View Details"**.
3. **Expected Outcome**: Drawer displays formatted JSON comparing `oldValues` and `newValues` with sensitive payload keys (`password`, `token`, `secret`) replaced with `[REDACTED]`.

---

## TypeScript Compilation & Test Suite Verification

Run the following commands in `admin/` to verify zero type errors and test suite completion:

```bash
cd admin
npx tsc --noEmit
npm test
```
