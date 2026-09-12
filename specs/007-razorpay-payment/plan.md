# Implementation Plan: Secure Razorpay Payment Integration

**Branch**: `feature/razorpay-payment` | **Date**: 2026-09-12 | **Spec**: [spec.md](file:///d:/CS-Next/specs/007-razorpay-payment/spec.md)

---

## Summary

Integrate the Razorpay payment gateway into the existing AIRAVÉ e-commerce platform across the Express backend, Next.js storefront, and PostgreSQL database. The implementation maintains backend calculation as the single source of truth, isolates secret keys, implements cryptographic HMAC SHA-256 signature verification, processes asynchronous webhooks idempotently, and guarantees zero stock leakage during concurrent checkouts without altering unrelated application modules.

---

## Technical Context

- **Language/Version**: TypeScript 5.7, Node.js v22 (ES Modules), Next.js 16 (React 19)
- **Primary Dependencies**: `express`, `@prisma/client`, `zod`, `crypto` (Node.js built-in), `razorpay` Node SDK
- **Storage**: PostgreSQL 16+ via Prisma ORM (`backend/prisma/schema.prisma`)
- **Testing**: Node.js test runner / Jest / Supertest integration suites, Razorpay Test Mode fixtures
- **Target Platform**: Node.js Linux/Windows backend server, Next.js web application
- **Project Type**: Full-stack e-commerce monorepo (`backend/`, `frontend/`, `admin/`)
- **Performance Goals**: <500ms payment verification and atomic order confirmation
- **Constraints**: Strict monochrome UI, Be Vietnam Pro typography, zero secret key exposure, zero destructive migrations, 15-minute reservation TTL
- **Scale/Scope**: Multi-item carts, concurrent checkouts, resilient webhook processing

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Principle I: Existing System First**: Implementation inspects and reuses existing controllers, services, repositories, and routes in `backend/` and `frontend/`.
- [x] **Principle II: Backend as Source of Truth**: All prices, taxes, discounts, shipping fees, and totals are computed by `CheckoutService.calculateCheckoutSummary`.
- [x] **Principle III: Payment Security**: `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` reside solely in backend `.env`. HMAC SHA-256 signatures are validated on the backend. No card data is stored.
- [x] **Principle IV: Order & Payment State Separation**: `Order` (`PENDING` $\rightarrow$ `CONFIRMED`) and `Payment` (`PENDING` $\rightarrow$ `CAPTURED`) are modeled and transitioned separately.
- [x] **Principle V: Idempotency & Concurrency Reliability**: Signature verification and webhook handlers check `Payment.status === CAPTURED` and execute inside atomic `prisma.$transaction`.
- [x] **Principle VI: Database Integrity**: Existing Prisma models (`Payment`, `PaymentTransaction`, `InventoryReservation`, `InventoryMovement`, `Invoice`) are reused without destructive migrations.
- [x] **Principle VII: Strict Authorization**: Customer access is restricted to their own orders; admin refund actions require `payments:write` permissions.
- [x] **Principle VIII: Observability & Safe Logging**: Structured audit logs and payment transactions recorded without logging secrets or PII.
- [x] **Principle IX: Comprehensive Testing**: End-to-end, webhook, failure, decline, signature mismatch, and concurrency tests defined.
- [x] **Principle X: Controlled Implementation**: Phased execution across 7 stages with zero uncontrolled changes.

---

## Project Structure

### Documentation (this feature)
```text
specs/007-razorpay-payment/
├── plan.md              # Implementation Plan (this document)
├── research.md          # Phase 0: Architectural Decision Records (ADRs)
├── data-model.md        # Phase 1: Entity definitions & state machines
├── quickstart.md        # Phase 1: Quickstart validation scenarios
├── contracts/           # Phase 1: Interface contracts (REST & Webhooks)
│   └── payment-api.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code Layout & Target Files
```text
backend/
├── src/
│   ├── config/
│   │   └── razorpay.ts              # [NEW] Razorpay SDK instance & env credential loader
│   ├── controllers/
│   │   ├── payment.controller.ts    # [MODIFY] Replace mock intent with Razorpay verify & webhook handlers
│   │   ├── order.controller.ts      # [MODIFY] Update placeOrder to handle Razorpay initiation
│   │   └── admin/
│   │       └── payments.controller.ts # [MODIFY] Add refund handler
│   ├── services/
│   │   ├── payment.service.ts       # [MODIFY] Implement Razorpay order creation, HMAC verification, capture & refund
│   │   ├── order.service.ts         # [MODIFY] Branch online orders to PENDING with 15-min reservation
│   │   └── admin/
│   │       └── payments.service.ts  # [MODIFY] Add admin refund execution logic
│   ├── routes/
│   │   ├── payments.routes.ts       # [MODIFY] Expose POST /verify and POST /webhook
│   │   └── admin/
│   │       └── payments.routes.ts   # [MODIFY] Expose POST /:id/refund
│   ├── validators/
│   │   └── payment.validator.ts     # [NEW] Zod schemas for payment verification and refund payloads
│   └── app.ts                       # [MODIFY] Preserve req.rawBody for webhook HMAC verification
└── package.json                     # [MODIFY] Add razorpay package

frontend/
├── src/
│   ├── app/(shop)/checkout/
│   │   └── page.tsx                 # [MODIFY] Integrate Razorpay Checkout SDK, dynamic script loading & verify flow
│   ├── lib/
│   │   ├── paymentApi.ts            # [NEW] Frontend client calls for /payments/verify and payment retry
│   │   └── orderApi.ts              # [MODIFY] Type updates for order creation response with Razorpay payload
│   └── types/
│       └── payment.ts               # [NEW] Razorpay window & response type declarations
```

---

## Phased Implementation Strategy

### PHASE 1 — Baseline & Safety
1. **Application Health**: Verify backend Express server and Next.js frontend compile cleanly without errors.
2. **Migration & Schema Status**: Confirm `backend/prisma/schema.prisma` is up-to-date and generated (`npx prisma generate`).
3. **Environment Isolation**: Verify that Razorpay test keys (`rzp_test_...`) are configured in `backend/.env` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `frontend/.env.local`.
4. **Safety Check**: Ensure no production keys are used during local testing and development.

---

### PHASE 2 — Payment Architecture & State Alignment
1. **Order Initiation Pattern**: `POST /api/v1/orders` creates an internal `Order` in `PENDING` status, `Payment` in `PENDING` status with `provider: "RAZORPAY"`, increments `quantityReserved`, and logs a 15-minute `InventoryReservation`.
2. **Gateway Order Creation**: Backend invokes Razorpay API (`orders.create({ amount, currency: "INR", receipt: orderNumber })`) and saves `order_...` as `providerPaymentId`.
3. **Cryptographic Verification**: `POST /api/v1/payments/verify` computes HMAC SHA-256 over `razorpay_order_id + "|" + razorpay_payment_id` using `RAZORPAY_KEY_SECRET`.
4. **Fulfillment Transaction**: Inside `prisma.$transaction`:
   - Transitions `Payment` to `CAPTURED` (`capturedAt: new Date()`).
   - Creates `PaymentTransaction` (`type: CAPTURE`, `providerTransactionId: razorpay_payment_id`).
   - Transitions `Order` to `CONFIRMED`.
   - Decrements `quantityOnHand` and `quantityReserved` on `Inventory`.
   - Creates `InventoryMovement` (`movementType: SALE`, `referenceType: "ORDER"`).
   - Marks `InventoryReservation` as `releasedAt: new Date()`.
   - Generates `Invoice` (`status: PAID`).
   - Clears user cart.
5. **Webhook Strategy**: `POST /api/v1/payments/webhook` verifies `X-Razorpay-Signature` against `req.rawBody` and processes `order.paid` / `payment.captured` with identical idempotent logic.

---

### PHASE 3 — Database & Schema Verification
1. **Schema Check**: All necessary models (`Payment`, `PaymentTransaction`, `InventoryReservation`, `InventoryMovement`, `Invoice`, `Refund`, `AuditLog`, `OrderStatusHistory`) already exist in `backend/prisma/schema.prisma`.
2. **Constraints**: Validate existing composite index/unique constraint `@@unique([provider, providerPaymentId])` on `Payment` and `@unique` on `PaymentTransaction.providerTransactionId`.
3. **Zero Migration Risk**: No structural DB changes or destructive migrations are required; existing schema fully accommodates the design.

---

### PHASE 4 — Backend Implementation
1. **Razorpay SDK & Config**:
   - Install `razorpay` in `backend/package.json`.
   - Create `backend/src/config/razorpay.ts` to export singleton `Razorpay` instance.
2. **Raw Body Capture**:
   - Update `backend/src/app.ts` `express.json` middleware to capture `(req as any).rawBody = buf;`.
3. **Validators**:
   - Create `backend/src/validators/payment.validator.ts` with `VerifyPaymentSchema` and `RefundPaymentSchema`.
4. **Payment Service (`backend/src/services/payment.service.ts`)**:
   - Implement `createRazorpayOrder(amount, currency, receipt, notes)`.
   - Implement `verifyPaymentSignature(orderNumber, razorpayOrderId, razorpayPaymentId, signature)`.
   - Implement `handleWebhookEvent(rawBody, signature, eventPayload)`.
   - Implement `refundPayment(paymentId, amount, reason, adminUserId)`.
5. **Order Service Updates (`backend/src/services/order.service.ts`)**:
   - Update `createOrder` to branch on `paymentMethod === "RAZORPAY"`: create order in `PENDING` state with reservation, call `PaymentService.createRazorpayOrder`, and attach public razorpay payload.
   - Retain immediate confirmation for `COD`.
6. **Routes & Controllers**:
   - Update `backend/src/controllers/payment.controller.ts` with `verifyPayment` and `handleWebhook`.
   - Update `backend/src/routes/payments.routes.ts` with `POST /verify` and `POST /webhook`.
   - Update `backend/src/controllers/admin/payments.controller.ts` and routes with `POST /:id/refund`.

---

### PHASE 5 — Frontend Storefront Integration
1. **Script Loader**:
   - Add Razorpay Checkout script loader (`https://checkout.razorpay.com/v1/checkout.js`) in `frontend/src/app/(shop)/checkout/page.tsx`.
2. **Payment Client**:
   - Create `frontend/src/lib/paymentApi.ts` for calling `POST /api/v1/payments/verify`.
3. **Checkout Submission Flow**:
   - When user chooses "Razorpay" and submits:
     1. Call `placeOrderApi` to receive `orderNumber` and `razorpay` options.
     2. Open `new (window as any).Razorpay(options).open()`.
     3. In `handler` callback, send signature payload to `verifyPaymentApi`.
     4. On successful verification, clear local cart and redirect to `/orders/[orderNumber]`.
4. **Error & Dismissal Handling**:
   - In `modal.ondismiss` callback or payment failure, display error toast and keep the user on checkout/order page with a "Retry Payment" action.

---

### PHASE 6 — Comprehensive Testing Plan
1. **Unit Tests**:
   - HMAC SHA-256 signature verification calculation (valid vs invalid signatures).
   - Smallest currency unit conversion (Rupees $\rightarrow$ Paise).
2. **Integration Tests**:
   - `POST /api/v1/orders` creates `PENDING` order with `InventoryReservation`.
   - `POST /api/v1/payments/verify` successfully captures payment, deducts stock, and creates invoice.
   - `POST /api/v1/payments/webhook` processes `order.paid` and `payment.captured` idempotently.
3. **Security & Concurrency Tests**:
   - Reject tampered signatures (`400 Bad Request`).
   - Reject unauthorized users trying to verify another user's order (`403 Forbidden`).
   - Prevent overselling when two concurrent users checkout the last in-stock item.
4. **Failure & Recovery Tests**:
   - Gateway decline creates `FAILED` transaction while keeping order in `PENDING` state.
   - Delayed webhook confirms order even if frontend verification never fired.

---

### PHASE 7 — Production Readiness & Deployment
1. **Environment Configuration**:
   - Staging & Production Razorpay Key ID and Secret configured in deployment environment secrets (Vercel / Render / AWS).
   - Set up Webhook URL in Razorpay Dashboard (`https://api.airave.com/api/v1/payments/webhook`) subscribed to `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`.
2. **Rollback Strategy**:
   - The changes are backward-compatible. If Razorpay is disabled, existing `COD` payments continue to operate seamlessly.
3. **Audit & Reconciliation**:
   - All transactions stored with full `gatewayResponse: Json` for automated end-of-day reconciliation.

---

## Detailed File-Level Change Matrix

| File Path | Action | Description & Rationale | Dependencies | Rollback Risk |
| :--- | :--- | :--- | :--- | :--- |
| `backend/package.json` | **MODIFY** | Add `razorpay` SDK dependency | `npm install razorpay` | Low (clean uninstall) |
| `backend/src/config/razorpay.ts` | **NEW** | Razorpay SDK singleton client initialization | `process.env` | None |
| `backend/src/app.ts` | **MODIFY** | Configure `express.json` to capture `req.rawBody` for webhook verification | None | Low |
| `backend/src/validators/payment.validator.ts` | **NEW** | Zod schemas for payment verification and refund payloads | `zod` | None |
| `backend/src/services/payment.service.ts` | **MODIFY** | Implement order creation, signature verification, webhook handler, and refunds | `@prisma/client`, `crypto` | Low |
| `backend/src/services/order.service.ts` | **MODIFY** | Branch `createOrder` for `RAZORPAY` (`PENDING` state + reservation) | `payment.service.ts` | Low |
| `backend/src/controllers/payment.controller.ts` | **MODIFY** | Route handlers for verification and webhooks | `payment.service.ts` | Low |
| `backend/src/routes/payments.routes.ts` | **MODIFY** | Expose `POST /verify` and `POST /webhook` | `payment.controller.ts` | Low |
| `backend/src/services/admin/payments.service.ts` | **MODIFY** | Implement administrative refund method | `payment.service.ts` | Low |
| `backend/src/controllers/admin/payments.controller.ts` | **MODIFY** | Add `refundPayment` controller action | `admin/payments.service.ts` | Low |
| `backend/src/routes/admin/payments.routes.ts` | **MODIFY** | Expose `POST /:id/refund` route with RBAC | `adminAuth`, `rbac` | Low |
| `frontend/src/types/payment.ts` | **NEW** | TypeScript declarations for Razorpay window SDK | None | None |
| `frontend/src/lib/paymentApi.ts` | **NEW** | API client methods for payment verification | `fetch` | None |
| `frontend/src/app/(shop)/checkout/page.tsx` | **MODIFY** | Load Razorpay SDK, trigger payment modal, handle callbacks & toasts | `paymentApi.ts` | Low |
