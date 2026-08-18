# Quickstart & REST API Validation Guide

This document provides curl commands and HTTP request scenarios to validate the REST API layer end-to-end.

---

## Prerequisites

1. PostgreSQL database running with initialized 48-table schema and seed data (`npx prisma db seed`).
2. Express server running locally on port 5000 (`npm run dev`).

---

## Runnable API Test Scenarios

### 1. Health Check
```bash
curl -X GET http://localhost:5000/health
```
**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2026-08-18T22:28:00.000Z",
  "uptime": 12.34
}
```

### 2. User Registration & Login
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@airave.com","password":"Password123!","firstName":"Jane","lastName":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@airave.com","password":"Password123!"}'
```

### 3. Browse Products & Filter Catalog
```bash
curl -X GET "http://localhost:5000/api/v1/products?page=1&limit=10&sortBy=price&sortOrder=asc"
```

### 4. Add Item to Cart (Guest or Authenticated)
```bash
curl -X POST http://localhost:5000/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{"variantId":"<VARIANT_UUID>","quantity":2}'
```

### 5. Place Order (Authenticated)
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"variantId":"<VARIANT_UUID>","quantity":1}],
    "shippingAddress": {
      "firstName": "Jane",
      "addressLine1": "123 Fashion Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "countryCode": "IN"
    }
  }'
```

### 6. Validation Error Scenario (Zod Runtime Guard)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"short"}'
```
**Expected HTTP 400 Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      { "field": "email", "issue": "Invalid email" },
      { "field": "password", "issue": "String must contain at least 8 character(s)" }
    ]
  }
}
```
