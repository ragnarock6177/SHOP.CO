# Quickstart & Validation Guide: Razorpay Payment Integration

**Feature**: Secure Razorpay Payment Integration  
**Spec Directory**: `specs/007-razorpay-payment`  
**Date**: 2026-09-12  

---

## 1. Prerequisites & Environment Setup

### Environment Variables
Ensure the following variables are present in `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
```

Ensure the public key is present in `frontend/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

---

## 2. Validation Scenarios

### Scenario 1: End-to-End Successful Checkout & Payment Verification
1. Open storefront at `http://localhost:3000`.
2. Add any in-stock garment (with selected size and color) to cart.
3. Proceed to `/checkout`.
4. Fill in or select delivery address.
5. Select "Razorpay" as payment method and click "Place Order".
6. Verify Razorpay Checkout modal appears with correct store name (`AIRAVÉ`) and payable amount (in INR).
7. Complete test payment using Razorpay Test UPI / Card details.
8. Verify frontend successfully redirects to `/orders/[orderNumber]`.
9. Verify database:
   - `Order.status` is `CONFIRMED`.
   - `Payment.status` is `CAPTURED`.
   - `PaymentTransaction` record exists with type `CAPTURE`.
   - `Invoice` record exists with status `PAID`.
   - Stock is decremented in `Inventory` and `InventoryMovement` (`SALE`) is recorded.
   - User cart is emptied.

---

### Scenario 2: Webhook Recovery on Disconnected Browser
1. Submit order on `/checkout` to get Razorpay order ID.
2. In Razorpay Dashboard or via test mock, trigger payment capture.
3. Close the browser before the frontend verification API is called.
4. Send signed webhook event `payment.captured` / `order.paid` to `http://localhost:5000/api/v1/payments/webhook` with header `X-Razorpay-Signature`.
5. Verify backend returns `200 OK`.
6. Inspect database: verify `Order.status` is `CONFIRMED` and stock is properly deducted.

---

### Scenario 3: Idempotent Duplicate Webhook & Verification Submission
1. Take an already confirmed order from Scenario 1.
2. Re-send the `payment.captured` webhook payload to `/api/v1/payments/webhook`.
3. Verify backend returns `200 OK` idempotently without double-deducting stock or creating duplicate invoices.
4. Re-submit `/api/v1/payments/verify` with the same signature payload.
5. Verify backend returns `200 OK` with confirmed order details.

---

### Scenario 4: Tampered Signature Rejection
1. Attempt to call `POST /api/v1/payments/verify` with an altered `razorpaySignature` or modified `razorpayOrderId`.
2. Verify backend returns `400 Bad Request` with message `"Invalid payment signature"`.
3. Verify database: order remains `PENDING` and no stock is deducted.

---

### Scenario 5: Payment Failure & Retry Flow
1. Open Razorpay modal and click the "Cancel / Close" button.
2. Verify frontend displays clear failure message with "Retry Payment" option.
3. Verify order remains in `PENDING` status.
4. Click "Retry Payment" and complete payment.
5. Verify order transitions to `CONFIRMED` under the same `orderNumber`.
