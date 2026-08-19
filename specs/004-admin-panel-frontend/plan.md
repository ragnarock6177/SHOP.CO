# Implementation Plan: Admin Panel Frontend

**Branch**: `004-admin-panel-frontend` | **Date**: 2026-08-19 | **Spec**: [spec.md](file:///d:/CS-Next/specs/004-admin-panel-frontend/spec.md)

**Input**: Feature specification from `/specs/004-admin-panel-frontend/spec.md`

## Summary

The AIRAVÉ Admin Panel Frontend is a Next.js 16 (App Router) single-page web application residing in `admin/`. It consumes backend REST APIs at `/api/v1/admin/*` using Axios and TanStack React Query for data fetching, caching, and state management. The user interface provides real-world ecommerce management capabilities including role-guarded sidebar layout, executive analytics dashboard, tabbed product forms with variant generators, dedicated stock adjustment modals, order state-machine transition controls, review moderation, return request inspection, transactional refund processing, role matrix configuration, and system audit logs with automatic sensitive payload redaction.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router)  
**Primary Dependencies**: Next.js 16, `@tanstack/react-query`, `@tanstack/react-table`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `radix-ui`, `sonner`, `recharts`, `framer-motion`, `tailwind-merge`, `clsx`  
**Storage**: Web Browser LocalStorage / HTTP-only Cookies (JWT session storage)  
**Testing**: Vitest (`vitest`), React Testing Library (`@testing-library/react`)  
**Target Platform**: Web Browsers (Desktop primary, Tablet/Mobile responsive)  
**Project Type**: Next.js Frontend Web Application (`admin/`)  
**Performance Goals**: Page transitions < 150ms, data table search debounce 300ms, initial bundle load < 2s  
**Constraints**: 100% REST API client consumption via Axios (`/api/v1/admin/*`), zero direct database access, zero backend code modifications, strict monochrome/neutral AIRAVÉ design system  
**Scale/Scope**: 15 implementation phases covering 28 administrative screens, 9 core domain modules, and complete RBAC UI guarding  

## Constitution Check

- **Pass**: All frontend operations strictly consume standard HTTP REST endpoints (`/api/v1/admin/*`).
- **Pass**: Zero Prisma or PostgreSQL database modifications introduced.
- **Pass**: Client-side permission checks serve UX display goals while backend middleware remains the authoritative security boundary.

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-panel-frontend/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical analysis & decisions (Phase 0)
├── data-model.md        # UI state models & entity mappings (Phase 1)
├── quickstart.md        # Runnable verification guide (Phase 1)
└── contracts/           # API integration contracts (Phase 1)
    └── admin-ui-contracts.md
```

### Source Code (`admin/` directory)

```text
admin/src/
├── app/                        # Next.js App Router Pages
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # /dashboard
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── collections/page.tsx
│   │   ├── attributes/page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   ├── movements/page.tsx
│   │   │   └── reservations/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── shipments/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── coupons/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── returns/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── refunds/page.tsx
│   │   ├── admin-users/page.tsx
│   │   ├── roles/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── audit-logs/page.tsx
├── components/
│   ├── ui/                    # Base Radix/Tailwind components
│   ├── layout/                # Sidebar, Header, Breadcrumbs, AdminLayout
│   ├── data-table/            # Reusable TanStack Data Table & Pagination
│   ├── filters/               # SearchInput, FilterPanel, DateRangeFilter
│   ├── forms/                 # FormField, ImageUploader, ProductForm, StockAdjustModal
│   ├── rbac/                  # PermissionGate, ProtectedRoute
│   └── feedback/              # EmptyState, LoadingState, ConfirmDialog
├── lib/
│   ├── apiClient.ts           # Axios client instance with Bearer interceptors
│   ├── utils.ts               # Classnames, currency formatters, date formatters
│   └── validators/            # Client-side Zod validation schemas
├── hooks/                     # Custom React Query & RBAC hooks
│   ├── useAuth.ts
│   ├── usePermission.ts
│   ├── useDataTable.ts
│   └── useDebounce.ts
├── providers/                 # AuthProvider, QueryClientProvider, ThemeProvider
└── types/                     # TypeScript API response and UI state interfaces
```

**Structure Decision**: Multi-directory web application in `admin/` using Next.js App Router route groups `(auth)` and `(dashboard)`.

## Complexity Tracking

*No constitution violations present.*
