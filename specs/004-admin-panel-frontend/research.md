# Research & Architectural Analysis: Admin Panel Frontend

**Feature**: Admin Panel Frontend (`specs/004-admin-panel-frontend`)  
**Date**: 2026-08-19

## 1. Existing Frontend Codebase Inspection

### Technology Stack Overview (`admin/package.json`)
- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI primitives (`radix-ui`), Lucide icons (`lucide-react`), Sonner toast notifications (`sonner`), Framer Motion (`framer-motion`), Recharts (`recharts`)
- **Data Fetching & State**: TanStack React Query (`@tanstack/react-query`), Axios (`axios`)
- **Tables**: TanStack React Table (`@tanstack/react-table`)
- **Form Validation**: React Hook Form (`react-hook-form`), Zod (`zod`), `@hookform/resolvers`

### Existing vs Needs To Be Created Analysis

| Category | Existing Components / Modules | Needs To Be Created |
|---|---|---|
| **App Routing** | `admin/src/app` root directory | Admin route groups `(auth)/login` and `(dashboard)/*` sub-pages |
| **HTTP Client** | `axios` dependency installed | Centralized `apiClient.ts` with auth token headers & error interceptor |
| **Auth Provider** | Basic `AuthProvider` shell | `useAuth()` hook with `GET /api/v1/auth/me` session restoration |
| **RBAC System** | None | `usePermission()` hook, `<PermissionGate>`, `<ProtectedRoute>` guards |
| **Layout UI** | Basic layout wrapper | Responsive Sidebar, Header, Breadcrumbs, AdminLayout container |
| **Data Tables** | `@tanstack/react-table` installed | Reusable `<DataTable>`, `<Pagination>`, `<TableSkeleton>` components |
| **Filters UI** | None | `<SearchInput>`, `<FilterPanel>`, `<DateRangeFilter>`, `<StatusBadge>` |
| **Business Modals** | `vaul` drawer dependency | `<StockAdjustModal>`, `<OrderCancelModal>`, `<RefundModal>`, `<ConfirmDialog>` |
| **Form System** | `react-hook-form`, `zod` installed | Reusable `<FormField>`, `<ImageUploader>`, `<RoleMatrixGrid>` components |

---

## 2. Technical Decisions & Rationale

### Decision 1: Server State Management with TanStack React Query
- **Decision**: Use TanStack React Query `@tanstack/react-query` as the sole server state cache manager.
- **Rationale**: Provides automatic query caching, background refetching on window focus, optimistic UI updates, and standardized loading/error states across all admin pages.
- **Alternatives Considered**: Redux Toolkit, Zustand, SWR. React Query is already installed in `admin/package.json` and perfectly matches Next.js App Router client component boundaries.

### Decision 2: Reusable Data Table Component Wrapper (`<DataTable>`)
- **Decision**: Build a single, highly configurable `<DataTable>` component wrapping `@tanstack/react-table`.
- **Rationale**: Prevents code duplication across 14 data table views (Products, Categories, Orders, Customers, Inventory, Coupons, Reviews, Audit Logs, etc.). Handles server-side pagination, sorting headers, row action dropdowns, and skeleton loading states seamlessly.
- **Alternatives Considered**: Ad-hoc HTML tables per page, third-party heavy grid libraries (AG-Grid). A custom TanStack wrapper leverages existing dependencies with total design system control.

### Decision 3: Business Operation UI over Direct Grid Editing
- **Decision**: Inventory stock quantities, order status values, customer statuses, and return workflow steps are edited exclusively through dedicated business modals and dropdown action triggers. Direct inline text field editing of stock balances or statuses is strictly prohibited.
- **Rationale**: Guarantees that inventory adjustments pass movement reasons (`PURCHASE`, `DAMAGE`, `RETURN`) to `POST /api/v1/admin/inventory/adjust` and order cancellations execute inventory release transactions via state-machine validation.
- **Alternatives Considered**: Editable table cells. Inline text editing bypasses audit logs and validation logic.

### Decision 4: URL Query Parameter Synchronization
- **Decision**: Synchronize table filters (`search`, `status`, `page`, `limit`, `sortBy`, `sortOrder`) with browser URL search parameters via Next.js `useSearchParams()` and `useRouter()`.
- **Rationale**: Allows admin staff to share direct URLs to specific filtered views (e.g., pending order lists, low-stock inventory alerts) and preserves search state on browser back/forward navigation.
- **Alternatives Considered**: In-memory React component state. In-memory state loses filter context on page refresh or URL sharing.

### Decision 5: Client-Side RBAC Guarding with Backend Security Boundary
- **Decision**: Implement `<PermissionGate>` and `usePermission()` hooks to dynamically hide/disable UI buttons and sidebar links, while relying 100% on backend HTTP 403 Forbidden responses as the true security boundary.
- **Rationale**: Provides immediate, intuitive feedback to staff without exposing non-permitted actions, while acknowledging that client-side authorization cannot be trusted for security.
