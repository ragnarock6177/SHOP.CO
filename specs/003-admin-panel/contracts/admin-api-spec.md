# API Contract Specification: AIRAVÉ Admin Panel (`/api/v1/admin`)

**Feature**: Admin Panel Specification & Plan  
**Branch**: `003-admin-panel`  
**Date**: 2026-08-19

---

## 1. Global Standard Response Contracts

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order status transition from SHIPPED to PENDING",
    "details": [
      {
        "field": "order_status",
        "issue": "Invalid enum state transition"
      }
    ]
  }
}
```

---

## 2. Resource Endpoint Contracts Summary

### Dashboard & Analytics
- `GET /api/v1/admin/dashboard`
  - Query: `fromDate`, `toDate`
  - Response: Operational metrics (gross sales, net revenue, low stock count, pending returns, order counts).

### Product Catalog
- `GET /api/v1/admin/products` - List with server-side filters (`status`, `visibility`, `category_id`, `search`, `page`, `limit`, `sort_by`)
- `POST /api/v1/admin/products` - Create product shell + attributes + variants
- `GET /api/v1/admin/products/:id` - Complete product detail breakdown
- `PUT /api/v1/admin/products/:id` - Full product update
- `DELETE /api/v1/admin/products/:id` - Archive product (`status = ARCHIVED`)

### Inventory Management
- `GET /api/v1/admin/inventory` - Inventory balances list
- `POST /api/v1/admin/inventory/adjust` - Transaction-safe stock adjustment
  - Request Body: `{ "variant_id": "UUID", "quantity_change": -5, "movement_type": "DAMAGE", "notes": "Water damaged in shelf 4B" }`
- `GET /api/v1/admin/inventory/movements` - Filterable audit log of inventory movements

### Orders & Fulfillment
- `GET /api/v1/admin/orders` - Filterable order list (`order_status`, `payment_status`, `search`, `from_date`, `to_date`)
- `GET /api/v1/admin/orders/:id` - Order snapshot + items + history timeline
- `PATCH /api/v1/admin/orders/:id/status` - State-machine status transition
  - Request Body: `{ "new_status": "PROCESSING", "notes": "Items picked and ready for packing" }`

### Shipments
- `GET /api/v1/admin/shipments` - Package list
- `POST /api/v1/admin/shipments` - Create shipment from order items
- `PATCH /api/v1/admin/shipments/:id/status` - Update shipment status

### After Sales (Returns & Refunds)
- `GET /api/v1/admin/returns` - Return requests list
- `PATCH /api/v1/admin/returns/:id/status` - Inspect & approve/reject return
- `GET /api/v1/admin/refunds` - Refund list
- `POST /api/v1/admin/refunds/process` - Execute gateway refund transaction

### Administration (Users, Roles & Audit Logs)
- `GET /api/v1/admin/admin-users` - Admin staff directory
- `POST /api/v1/admin/admin-users` - Create admin user
- `GET /api/v1/admin/roles` - List system roles and permission mappings
- `PUT /api/v1/admin/roles/:id` - Update role permissions
- `GET /api/v1/admin/audit-logs` - Read-only immutable audit feed
