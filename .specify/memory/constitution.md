<!--
# Sync Impact Report
Version Change: 0.0.0 → 1.0.0
Bump Type: MAJOR (Initial Ratification of Project Constitution)
Ratification Date: 2026-09-12
Last Amended: 2026-09-12

Modified Principles:
- Initialized 10 core non-negotiable architectural and operational principles.

Added Sections:
- Core Principles (I through X: Existing System First, Backend as Source of Truth, Payment Security, Order & Payment Separation, Idempotency & Reliability, Database Integrity, Authorization, Observability, Testing, Controlled Implementation)
- Development Constraints & Technical Standards (Monorepo architecture, concrete file references, Razorpay integration contracts, UI typography rules)
- Quality Gates & Workflow Discipline (Spec Kit phased execution, architectural decision records, review standards)
- Governance (Supremacy, amendment procedure, semver policy, compliance review)

Removed Sections:
- Replaced unpopulated template placeholders.

Deferred Items / Follow-ups:
- None. All template placeholders resolved to concrete project rules.
-->

# AIRAVÉ E-Commerce Platform Constitution

## Core Principles

### I. Existing System First
- **Source of Truth**: The existing codebase is the definitive baseline and source of truth.
- **Pre-Implementation Inspection**: Engineers and AI agents MUST inspect active implementations across `backend/`, `frontend/`, and `admin/` prior to proposing or drafting changes.
- **Architectural Preservation**: Do NOT assume generic e-commerce conventions. Existing design patterns, naming conventions, service layers, and repository patterns MUST be preserved and reused unless an explicit, documented architectural justification is accepted.

### II. Backend as Source of Truth
- **Authoritative Calculations**: All product prices, variant pricing, coupon discounts, shipping costs, taxes, inventory availability, and final payable sums MUST be calculated and validated exclusively on the backend (`backend/src/services/`).
- **Zero Client Trust**: Client-submitted totals, discounts, fees, or line-item prices MUST NEVER be trusted or accepted for order placement or payment transactions.

### III. Payment Security & Credential Isolation
- **Secret Isolation**: Razorpay secret keys (`RAZORPAY_KEY_SECRET`), webhook secrets (`RAZORPAY_WEBHOOK_SECRET`), and administrative credentials MUST strictly reside in backend environment variables and NEVER be exposed to the client or checked into version control.
- **Cryptographic Verification**: All payment completion signatures and incoming webhook payloads MUST be cryptographically verified using HMAC SHA-256 on the backend prior to any state mutation.
- **No Direct Frontend Authorization**: An order or payment MUST NEVER be marked as `PAID` or `CAPTURED` solely based on frontend callbacks or client API calls.
- **PCI-DSS Compliance**: Raw credit/debit card numbers, CVVs, expiration dates, or sensitive banking credentials MUST NEVER be processed, logged, or persisted in the database.

### IV. Order and Payment State Separation
- **Decoupled State Machines**: Internal `Order` lifecycle (`OrderStatus`: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, etc.) and `Payment` lifecycle (`PaymentStatus`: `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, etc.) MUST be modeled as separate, distinct entities in schema and business logic.
- **Explicit Transitions**: State transitions MUST follow strict, deterministic paths with validation gates.
- **Retry Safety**: Failed, cancelled, or retried payment attempts MUST NOT leave dangling or corrupt order records. An order may have multiple payment attempts (`Payment` / `PaymentTransaction` records) without corrupting order integrity.

### V. Idempotency & Concurrency Reliability
- **Idempotent Operations**: Duplicate checkout requests, verification API calls, and webhook events MUST be handled safely and idempotently without double-charging, double-fulfilling, or corrupting inventory.
- **Resilience to Network Anomalies**: The payment system MUST gracefully handle client disconnects, page reloads, out-of-order webhooks, delayed gateway confirmations, and concurrent verification triggers.

### VI. Database Integrity & Transactional Consistency
- **Prisma Transactions**: Critical multi-table operations (e.g., inventory deduction, order creation, payment state transitions, coupon usage recording) MUST execute within interactive Prisma transactions (`prisma.$transaction`).
- **Data & Migration Safety**: Existing customer, catalog, and transactional data MUST be preserved. Destructive migrations (dropping columns, truncating tables) are prohibited.
- **Explicit Schema Indexing**: Required foreign keys, relational constraints, unique indexes (such as `[provider, provider_payment_id]`), and lookup indexes MUST be maintained in `backend/prisma/schema.prisma`. Unrelated models MUST NOT be modified without documented necessity.

### VII. Strict Authorization & Access Control
- **Customer Perimeter**: Authenticated customers MUST only access, view, or initiate payments for their own orders and addresses.
- **Administrative Privileges**: Payment captures, manual verifications, dispute actions, and refunds MUST require verified administrative roles and role-based permissions (`backend/src/middleware/`).
- **Webhook Boundary**: Webhook endpoints MUST be decoupled from customer session authentication and authenticate strictly via webhook signatures.

### VIII. Observability, Traceability & Safe Logging
- **Lifecycle Auditability**: Every payment lifecycle transition, webhook arrival, gateway call, and state alteration MUST be traceable with contextual metadata and audit logs (`AuditLog` / `OrderStatusHistory`).
- **Secret & PII Redaction**: Logs MUST NEVER record payment secret keys, webhook secrets, authentication tokens, full card details, or sensitive personally identifiable customer information.
- **Failure Diagnostics**: Every payment failure or gateway rejection MUST record structured diagnostic metadata (`failureCode`, `failureMessage`, gateway responses) to enable rapid troubleshooting.

### IX. Comprehensive Testing & Environment Segregation
- **Scenario Coverage**: Automated test suites and manual validation plans MUST cover every state transition, failure pathway, signature mismatch, webhook retry, and concurrent double-submission scenario.
- **Environment Isolation**: Razorpay Test Mode keys and mock fixtures MUST be used across development and test environments before deploying live production credentials.

### X. Controlled, Incremental Implementation
- **Monolithic Prohibition**: Payment gateways and mission-critical checkout features MUST NOT be implemented in a single uncontrolled, massive pull request.
- **Spec Kit Lifecycle**: Implementation MUST strictly follow the standard sequential lifecycle:
  `Understand → Specify (/speckit-specify) → Clarify (/speckit-clarify) → Plan (/speckit-plan) → Tasks (/speckit-tasks) → Implement (/speckit-implement) → Test → Review`.
- **Dependency Hygiene**: Unnecessary external packages MUST NOT be installed. Working components MUST NOT be refactored or rewritten without concrete diagnostic evidence.

## Development Constraints & Technical Standards

### Architectural Structure & Concrete File References
- **Monorepo Organization**:
  - `backend/`: Node.js Express TypeScript REST API (`backend/src/app.ts`, `backend/src/server.ts`).
  - `backend/prisma/schema.prisma`: Authoritative database schema with `Order`, `OrderItem`, `Payment`, `PaymentTransaction`, `Refund`, `Inventory`, `Coupon`, and `AuditLog` models.
  - `backend/src/routes/`: Route declarations including `payments.routes.ts`, `orders.routes.ts`, `cart.routes.ts`, `auth.routes.ts`, `admin.routes.ts`.
  - `backend/src/controllers/` & `backend/src/services/`: Core request validation, payment processing, signature verification, and transactional fulfillment.
  - `backend/src/middleware/`: Authentication, authorization, error handling, and webhook payload processing.
  - `frontend/`: Next.js 16 App Router application (`frontend/src/app/(shop)/checkout/`, `frontend/src/context/`).
  - `admin/`: Next.js administrative back-office management console.
- **Typography & UI Constraints**:
  - Storefront and admin UI MUST strictly utilize **Be Vietnam Pro** (`var(--font-be-vietnam)`).
  - Monospace fonts, raw `<code>` elements, or `font-mono` classes MUST NEVER be introduced into storefront or admin user interfaces.
  - Mobile dynamic height compatibility MUST utilize `min-h-[100dvh]` or `h-[100dvh]`.
- **Explicit Assumptions & Unknowns**:
  - Every technical plan, specification, and implementation task MUST explicitly document baseline assumptions and identified unknowns before executing changes.

## Quality Gates & Workflow Discipline

1. **Phase Discipline**: Code generation for payment systems cannot begin without an approved specification (`spec.md`), technical implementation plan (`plan.md`), and ordered task list (`tasks.md`).
2. **Atomic & Reviewable Changes**: Changes MUST be partitioned into small, testable increments aligned with defined tasks.
3. **Architectural Decision Records (ADR)**: Any necessary deviation from existing database schema or controller-service-repository patterns requires an explicit architectural note with rationale and impact analysis.
4. **Pre-Merge Verification**: Unit, integration, and signature verification tests MUST pass prior to merging into release branches.

## Governance

- **Constitution Supremacy**: This constitution constitutes the governing standard for the AIRAVÉ repository. Its principles supersede ad-hoc practices or unreviewed short-cuts.
- **Amendment Procedure**: Amendments to this document require explicit stakeholder justification, risk analysis, version incrementation, and documentation in the Sync Impact Report.
- **Versioning Policy**: Semantic Versioning rules apply:
  - **MAJOR**: Structural changes, principle deletions, or fundamental policy shifts.
  - **MINOR**: Addition of new principles, sections, or expanded technical constraints.
  - **PATCH**: Non-semantic clarifications, typographical corrections, or wording refinements.
- **Compliance Review**: All Pull Requests and Spec Kit workflows (`/speckit-specify`, `/speckit-plan`, `/speckit-implement`) MUST verify and document adherence to these principles.

**Version**: 1.0.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-12
