# Research & Architectural Decision Records (ADR)

**Feature**: Secure Razorpay Payment Integration  
**Spec Directory**: `specs/007-razorpay-payment`  
**Date**: 2026-09-12  

---

## 1. Gateway Client: Official SDK vs Lightweight HTTP REST Client

### Decision
Use the official `razorpay` Node.js SDK (or standardized REST client wrapper with native `fetch` / built-in `crypto`) within a centralized `RazorpayClient` service (`backend/src/lib/razorpay.ts`).

### Rationale
- The official `razorpay` package standardizes typing, error codes, and signature utilities while remaining lightweight (<50kb).
- Cryptographic verification (`crypto.createHmac("sha256", secret).update(body).digest("hex")`) relies on standard Node.js built-ins for maximum security and zero external crypto vulnerabilities.

### Alternatives Considered
- *Custom HTTP wrapper around Razorpay REST API*: Avoids new npm dependency, but requires writing manual request wrappers, pagination handlers, and webhook signature verification logic from scratch.
- *Stripe / Multiple SDKs*: The active project scope specifically targets Razorpay for Indian Rupees (INR) and domestic payment methods (UPI, Cards, NetBanking).

---

## 2. Order Lifecycle Sequencing: Internal Order First vs Ephemeral Intent

### Decision
**Internal Order Created First in `PENDING` Status** (`POST /api/v1/orders`).
1. `OrderService.createOrder` creates an internal `Order` with `status: PENDING`, creates an `InventoryReservation` with a 15-minute TTL, and creates the Razorpay order via Razorpay API.
2. The internal `orderNumber` is used as the Razorpay `receipt` identifier.
3. Upon signature verification or webhook arrival, the order is updated to `CONFIRMED` and stock is deducted via `InventoryMovement` (`SALE`).

### Rationale
- **Deterministic Identifier**: Guarantees that every Razorpay transaction maps 1:1 with an immutable internal `orderNumber` and database record.
- **Retry Safety**: If a payment attempt fails or is dismissed, the order is not lost; the user can retry payment without regenerating their cart or creating duplicate conflicting orders.
- **Atomic Stock Reservation**: Prevents overselling during high-traffic drops while the customer is in the payment modal.

### Alternatives Considered
- *Ephemeral Intent First (Order created only after payment)*: If the user's browser closes or the database fails during post-payment insertion, the customer is charged without an order record ever existing in the database.

---

## 3. Webhook Raw Body Capture & Signature Verification

### Decision
Preserve `req.rawBody` buffer in Express middleware for webhook signature verification.
Configure `express.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf; } })` in `backend/src/app.ts` or mount raw body parser on `POST /api/v1/payments/webhook`.

### Rationale
- Razorpay webhook signatures are HMAC SHA-256 hashes generated over the verbatim raw HTTP payload.
- Standard JSON re-stringification (`JSON.stringify(req.body)`) alters whitespace and key ordering, causing valid webhook signatures to fail verification.

### Alternatives Considered
- *Re-stringifying `req.body`*: Highly unreliable, causes random webhook rejection and dropped orders.
- *Separate raw body middleware route*: Feasible, but preserving `req.rawBody` globally in `express.json` verify callback is cleaner and backward-compatible with all existing endpoints.

---

## 4. Idempotency Strategy for Concurrent Webhook & Verification Callbacks

### Decision
Dual-layer idempotency guard:
1. **Database Constraint & Check**: `Payment.providerPaymentId` (Razorpay Order ID `order_...`) is unique per provider. In `PaymentService.handlePaymentSuccess`, inspect `if (payment.status === PaymentStatus.CAPTURED) return payment;` inside `prisma.$transaction`.
2. **Transaction Isolation**: The state transition (Payment $\rightarrow$ `CAPTURED`, Order $\rightarrow$ `CONFIRMED`, stock movement creation, invoice issuance) runs in an atomic transaction with row locking.

### Rationale
- The frontend redirect and the gateway webhook can arrive within milliseconds of each other.
- Checking payment state within the transaction ensures that whichever handler acquires the lock first completes the transition, and the subsequent handler safely exits as a no-op with HTTP 200.

### Alternatives Considered
- *Redis distributed locks*: Adds unnecessary infrastructure dependency for single/clustered Postgres database where transactional row locks and unique constraints are already atomic and ACID-compliant.

---

## 5. Stock Hold & Release Mechanism

### Decision
Use existing `InventoryReservation` model with a 15-minute expiration timestamp (`expiresAt = new Date(Date.now() + 15 * 60 * 1000)`).
- On Order Creation: `quantityReserved` incremented on `Inventory`.
- On Payment Capture: `quantityOnHand` decremented, `quantityReserved` decremented, `InventoryMovement` (`SALE`) logged, reservation marked `releasedAt = new Date()`.
- On Cancellation / Expiry: `quantityReserved` decremented, reservation marked `releasedAt = new Date()`.

### Rationale
- Reuses existing database models in `backend/prisma/schema.prisma` without schema migrations.
- Keeps inventory calculations accurate and prevents double-booking while customer interacts with payment gateway.
