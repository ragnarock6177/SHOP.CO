# Interface Contracts: Razorpay Payment & Order APIs

**Feature**: Secure Razorpay Payment Integration  
**Spec Directory**: `specs/007-razorpay-payment`  
**Date**: 2026-09-12  

---

## 1. Create Order with Razorpay Payment Initiation

- **Method**: `POST`
- **Path**: `/api/v1/orders`
- **Auth**: `optionalAuth` (Supported for Authenticated User and Guest)
- **Middleware**: `validateRequest(CreateOrderSchema)`

### Request Payload
```json
{
  "items": [
    {
      "variantId": "3b2e5f80-0a12-4c89-9134-8c76391d4e21",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun@example.com",
    "phone": "+919876543210",
    "addressLine1": "42 Marine Drive",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400020",
    "countryCode": "IN"
  },
  "couponCode": "AIRAVE15",
  "shippingSpeed": "STANDARD",
  "paymentMethod": "RAZORPAY"
}
```

### Response Payload (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "c1f7b8a0-7b92-4f1e-9a10-8e1234567890",
    "orderNumber": "ORD-1773412000000-4821",
    "status": "PENDING",
    "totalAmount": 2849.00,
    "currency": "INR",
    "razorpay": {
      "keyId": "rzp_test_1DP5mmOlF5G5ag",
      "orderId": "order_EKfA98SbR28pwt",
      "amount": 284900,
      "currency": "INR",
      "name": "AIRAVÉ",
      "description": "Order #ORD-1773412000000-4821",
      "prefill": {
        "name": "Arjun Sharma",
        "email": "arjun@example.com",
        "contact": "+919876543210"
      }
    }
  },
  "message": "Order created successfully. Complete payment to confirm."
}
```

---

## 2. Verify Razorpay Payment Signature

- **Method**: `POST`
- **Path**: `/api/v1/payments/verify`
- **Auth**: `optionalAuth`
- **Middleware**: `validateRequest(VerifyPaymentSchema)`

### Request Payload
```json
{
  "orderNumber": "ORD-1773412000000-4821",
  "razorpayOrderId": "order_EKfA98SbR28pwt",
  "razorpayPaymentId": "pay_29QQoUBcxrhLEZ",
  "razorpaySignature": "9ef4ff4d843da4204ebb8886134e16444da69582dbe0b213073e3b23c0993501"
}
```

### Response Payload (`200 OK`)
```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-1773412000000-4821",
    "status": "CONFIRMED",
    "paymentStatus": "CAPTURED",
    "amount": 2849.00,
    "currency": "INR",
    "transactionId": "pay_29QQoUBcxrhLEZ",
    "invoiceNumber": "INV-1773412050000-9182"
  },
  "message": "Payment verified and order confirmed successfully."
}
```

---

## 3. Razorpay Webhook Endpoint

- **Method**: `POST`
- **Path**: `/api/v1/payments/webhook`
- **Auth**: None (Public webhook endpoint verified cryptographically)
- **Headers Required**: `X-Razorpay-Signature`, `Content-Type: application/json`

### Supported Events
- `order.paid`
- `payment.captured`
- `payment.failed`
- `refund.processed`

### Response Payload (`200 OK`)
```json
{
  "success": true,
  "message": "Webhook processed successfully."
}
```

---

## 4. Admin Refund Endpoint

- **Method**: `POST`
- **Path**: `/api/v1/admin/payments/:id/refund`
- **Auth**: `requireAdminAuth`, `requirePermission("payments:write")`

### Request Payload
```json
{
  "amount": 2849.00,
  "reason": "Customer returned items in original condition"
}
```

### Response Payload (`200 OK`)
```json
{
  "success": true,
  "data": {
    "refundId": "5f9c4d21-9876-410a-b321-abcdef123456",
    "providerRefundId": "rfnd_8e1234567890ab",
    "paymentId": "7e2a9b31-4567-410a-9123-bcdef1234567",
    "orderId": "c1f7b8a0-7b92-4f1e-9a10-8e1234567890",
    "amount": 2849.00,
    "currency": "INR",
    "status": "COMPLETED"
  },
  "message": "Refund processed successfully."
}
```
