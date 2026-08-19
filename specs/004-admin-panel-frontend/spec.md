# Feature Specification: Admin Panel Frontend

**Feature Branch**: `004-admin-panel-frontend`  
**Created**: 2026-08-19  
**Status**: Approved Specification  
**Input**: User description: "Build the complete ADMIN PANEL FRONTEND for my ecommerce application."

---

## 1. Problem Statement

The AIRAVÉ backend API ecosystem provides comprehensive administrative endpoints (`/api/v1/admin/*`) covering catalog management, inventory control, order state-machine transitions, after-sales workflows, RBAC role management, and audit trailing. However, staff members currently lack a unified, production-ready graphical interface. Operating via raw API callers or direct database scripts is error-prone, insecure, and inefficient. The platform requires a dedicated Next.js App Router admin application (`admin/`) that translates business workflows into a fast, highly polished, and responsive web user interface.

---

## 2. Goals

- **Comprehensive Admin UI**: Deliver a production-ready Next.js App Router single-page application under `admin/` consuming standard `/api/v1/admin/*` REST endpoints.
- **Role-Based UX Guarding**: Dynamically obscure or show navigation elements, action buttons, and page routes based on authenticated admin staff permissions while keeping backend authorization as the security boundary.
- **Operational Efficiency**: Provide real-world ecommerce management screens—such as dedicated business-modal stock adjustments, state-machine order status transitions, and role matrix mapping—rather than plain CRUD tables.
- **Strict Separation of Concerns**: Enforce 100% REST client consumption via Axios and TanStack React Query without direct database or Prisma access.
- **Design System Consistency**: Maintain a modern, dark-mode/light-mode monochrome and neutral aesthetic matching AIRAVÉ UI standards using Tailwind CSS v4, Lucide icons, Radix UI, and Sonner notifications.

---

## 3. Non-Goals

- **Backend API Modifications**: No new controllers, routes, middleware, or services will be implemented in `backend/`.
- **Database Schema Changes**: No Prisma schema alterations, migrations, or database table updates will be performed.
- **Storefront End-User UI**: Public-facing customer screens are out of scope for this admin specification.
- **Direct Database Connections**: The frontend application will never connect directly to PostgreSQL or Prisma.

---

## 4. Existing Frontend Architecture

The admin application (`admin/`) is initialized with Next.js 16 (App Router), React 19, and TypeScript.

- **Routing Framework**: Next.js App Router (`admin/src/app`).
- **State & Data Fetching**: TanStack React Query (`@tanstack/react-query`) for server state management, caching, background refetching, and optimistic updates; Axios (`axios`) for HTTP client requests.
- **Data Table Architecture**: TanStack React Table (`@tanstack/react-table`) for server-side pagination, sorting, and column definitions.
- **Form Management**: React Hook Form (`react-hook-form`), Zod schemas (`zod`), and `@hookform/resolvers`.
- **UI Components & Styling**: Tailwind CSS v4, Radix UI primitives, Lucide React icons (`lucide-react`), Sonner toast notifications (`sonner`), Framer Motion, and Recharts.

---

## 5. Admin Information Architecture

The admin application structure is organized into 9 primary functional domain modules:

```
ADMIN PANEL IA
├── 1. Authentication & Session (/login, /forgot-password)
├── 2. Executive Dashboard (/dashboard)
├── 3. Catalog Management
│   ├── Products (/products, /products/new, /products/[id])
│   ├── Categories (/categories)
│   ├── Collections (/collections)
│   └── Attributes & Swatches (/attributes)
├── 4. Inventory Operations
│   ├── Stock Balances (/inventory)
│   ├── Movements Log (/inventory/movements)
│   └── Active Reservations (/inventory/reservations)
├── 5. Sales & Orders
│   ├── Orders Directory (/orders, /orders/[id])
│   ├── Shipments & Tracking (/shipments, /shipments/[id])
│   ├── Payment Logs (/payments, /payments/[id])
│   └── Invoices (/invoices)
├── 6. Customer Relations
│   └── Customers Directory (/customers, /customers/[id])
├── 7. Marketing & Promotions
│   └── Coupons & Discounts (/coupons, /coupons/new, /coupons/[id])
├── 8. Engagement & Content
│   └── Review Moderation (/reviews)
├── 9. After-Sales Operations
│   ├── Return Requests (/returns, /returns/[id])
│   └── Refund Ledger (/refunds, /refunds/[id])
└── 10. Platform Administration
    ├── Staff Accounts (/admin-users)
    ├── Roles & Permissions (/roles, /roles/[id])
    └── System Audit Trail (/audit-logs)
```

---

## 6. Authentication & Session Management

- **Login Flow**: `/login` route featuring email and password inputs with Zod validation. Submits to `POST /api/v1/auth/login`.
- **Token Persistence**: JWT access token stored in HTTP-only cookies or encrypted local storage via the existing frontend `AuthContext` provider.
- **Session Restoration**: On app load, `GET /api/v1/auth/me` verifies current token validity and populates admin user details and assigned permissions.
- **Protected Route Guard**: Middleware wrapper (`AdminAuthGuard`) intercepts unauthenticated routes and redirects to `/login?redirect={pathname}`.
- **Session Expiration**: 401 Unauthorized API responses automatically trigger token invalidation, display a Sonner toast notification ("Session expired. Please log in again."), and redirect to `/login`.
- **Logout Action**: Triggered from Header user menu; calls `POST /api/v1/auth/logout`, clears local query cache, and redirects to `/login`.

---

## 7. RBAC & Permissions Framework

- **Permission State**: Permissions list loaded upon authentication into React Query cache and accessible via a custom `usePermission()` hook.
- **SUPER_ADMIN Bypass**: Users with role `SUPER_ADMIN` implicitly evaluate `true` for all permission checks.
- **UI Guard Components**:
  - `<PermissionGuard permission="products:create">`: Renders children only if staff possesses the specified permission.
  - `<Button disabled={!hasPermission('orders:update_status')}>`: Disables action buttons with tooltip explanation when permission is missing.
- **Route Protection**: Page-level wrapper components evaluate required module permissions and render an accessible `403 Forbidden` placeholder if access is denied.
- **Security Boundary**: All frontend RBAC checks exist solely for UX optimization. Backend middleware remains the authoritative security boundary.

---

## 8. Admin Layout & Navigation System

### Sidebar Navigation
- **Persistent Left Rail**: Collapsible sidebar with dark/neutral styling, AIRAVÉ branding header, and active route highlight tracks.
- **Navigation Groups**:
  - **Main**: Dashboard
  - **Catalog**: Products, Categories, Collections, Attributes
  - **Inventory**: Inventory Balances, Movement Logs, Active Reservations
  - **Sales**: Orders, Shipments, Payments, Invoices
  - **Customers**: Customer Accounts
  - **Marketing**: Coupon Codes
  - **Engagement**: Product Reviews
  - **After Sales**: Return Requests, Refund Ledger
  - **Administration**: Admin Users, Roles & Permissions, Audit Logs
- **Mobile Responsive Drawer**: On viewports `< 1024px`, sidebar collapses into a slide-over sheet triggered by a header hamburger button.
- **Permission Filtering**: Navigation items are dynamically hidden if the logged-in staff user lacks `read` permissions for that module.

### Header Bar
- **Breadcrumb Navigation**: Dynamic breadcrumbs (e.g., `Admin / Catalog / Products / Edit Product`).
- **Global Search Input**: Quick lookup bar supporting Order #, SKU, or Customer Email searches.
- **Environment Indicator**: Badge indicating current environment (`Production`, `Staging`, `Development`).
- **Staff User Menu**: Dropdown displaying staff avatar/initials, full name, role badge, profile link, and Logout action.

---

## 9. Dashboard & Operational Analytics

- **KPI Cards**:
  - Gross Sales Revenue (Formatted in INR `₹`)
  - Today's Orders Count & Total Orders Count
  - Low Stock & Out-of-Stock Alert Counters
  - Pending Returns & Refunds Counters
  - Active Customers Count
- **Recent Activity Streams**:
  - **Recent Orders Widget**: Table showing last 10 orders with order number, customer name, total amount, order status badge, and payment status badge.
  - **Low Stock Warning Feed**: Interactive list of variants whose available quantity (`quantityOnHand - quantityReserved`) is below `reorderLevel`.
  - **System Audit Trail Feed**: Real-time log feed showing latest 10 administrative actions with actor user name and timestamp.
- **Date Range Selector**: Filter control allowing date boundaries (`Today`, `Last 7 Days`, `Last 30 Days`, `Custom Range`) re-fetching `GET /api/v1/admin/dashboard`.

---

## 10. Product Management

### Product List View (`/products`)
- **Data Table**: Columns for Product Image, Name & Slug, Base Price, Compare Price, Category, Status Badge (`DRAFT`, `PUBLISHED`, `ARCHIVED`), Visibility (`PUBLIC`, `PRIVATE`, `HIDDEN`), Variant Count, and Action Menu.
- **Filters & Search**: Search bar (name, slug, description), Status dropdown (`DRAFT`, `PUBLISHED`, `ARCHIVED`), Visibility dropdown, Category filter dropdown, Collection filter dropdown.
- **Actions**: "Create Product" primary button, Edit action link, and Soft-Archive confirmation modal (`DELETE /api/v1/admin/products/:id`).

### Product Create / Edit Form (`/products/new`, `/products/[id]`)
- **Tabbed / Sectioned Layout**:
  1. **General Information**: Product Name, Slug (auto-generated slugify option), Short Description, Detailed Description (Rich text editor / Markdown editor), Care Instructions, Tax Code.
  2. **Categorization**: Primary Category selector, Secondary Categories multi-select, Collections multi-select.
  3. **Pricing & Currency**: Base Price (`Decimal`), Compare-at Price (`Decimal`), Currency display (`INR`).
  4. **Status & Publishing**: Status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), Visibility (`PUBLIC`, `PRIVATE`, `HIDDEN`).
  5. **Media Gallery**: Image URL uploader/gallery list with drag-and-drop sort order, primary image toggle badge, and alt text inputs.
  6. **Variants Overview**: Embedded variant table showing SKU, Price, Inventory, Attributes, and Quick-Edit actions.

---

## 11. Categories Management (`/categories`)

- **Tree View / Grid Table**: Displays hierarchical parent-child category tree, Category Name, Slug, Status (`ACTIVE`, `INACTIVE`), Sort Order, and Product Count.
- **Category Create / Edit Modal**: Form inputs for Category Name, Slug, Description, Parent Category selector (with self-parent validation: `parentId !== id`), Image URL, Status, and Sort Order.
- **Backend API Consumption**: Consumes `GET`, `POST`, `PUT /api/v1/admin/categories`.

---

## 12. Collections Management (`/collections`)

- **Collections Data Table**: Displays Collection Name, Slug, Description, Status (`ACTIVE`, `INACTIVE`), Sort Order, and Assigned Product Count.
- **Collection Create / Edit Modal**: Form fields for Name, Slug, Description, Header Image URL, Status, and Sort Order.
- **Backend API Consumption**: Consumes `GET`, `POST`, `PUT /api/v1/admin/collections`.

---

## 13. Attributes & Swatch Management (`/attributes`)

- **Attribute Directory**: Table listing Attribute Name (e.g., `Size`, `Color`), Slug, Flags (`isVariantAttribute`, `isFilterable`, `isVisible`), Sort Order, and Value Count.
- **Attribute Values Swatch Drawer**: Expandable drawer/modal showing assigned values (e.g., `Red`, `#FF0000`, `Small`, `S`), Color Hex preview pill, Image URL, and Add Value form (`POST /api/v1/admin/attributes/:id/values`).

---

## 14. Product Variant Management

- **Embedded Variant Form / Modal**:
  - SKU (Unique text string input).
  - Barcode (UPC/EAN string input).
  - Price & Compare-at Price override inputs.
  - Cost Price (Internal cost calculation field).
  - Weight in Grams input.
  - Active Toggle (`isActive`) & Default Variant Radio (`isDefault`).
  - Attribute Value Mappings (Selection dropdowns for registered size/color attribute values).

---

## 15. Inventory & Stock Adjustments

### Stock Balances View (`/inventory`)
- **Inventory Balance Table**: Variant SKU, Product Name, Barcode, Stock on Hand (`quantityOnHand`), Reserved Quantity (`quantityReserved`), Available Quantity (`quantityOnHand - quantityReserved`), Reorder Level Threshold (`reorderLevel`), Stock Status Pill (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), and Quick Adjust Action Button.
- **Filters**: Search by SKU, Barcode, or Product Name; Filter by Stock Status (`Low Stock`, `Out of Stock`).

### Dedicated Stock Adjustment Modal
- **Strict Business UI**: Text fields for quantity on hand are **READ-ONLY**. Manual direct typing of stock balances is strictly prohibited.
- **Adjustment Workflow**:
  - Displays current On Hand, Reserved, and Available stock.
  - Movement Type selector: `PURCHASE` (Stock In), `ADJUSTMENT` (Correction), `DAMAGE` (Stock Out), `LOSS` (Stock Out), `RETURN` (Stock In).
  - Quantity Change integer input (e.g., `+50` or `-5`).
  - Resulting Stock Preview (`Current On Hand + Change`).
  - Internal Notes text area.
  - Submits to `POST /api/v1/admin/inventory/adjust`.
- **Validation**: Displays inline `ValidationError` toast if an adjustment results in negative stock on hand.

### Inventory Movement Logs (`/inventory/movements`) & Reservations (`/inventory/reservations`)
- **Movements Log Table**: Read-only log showing Timestamp, SKU, Product Name, Movement Type badge, Quantity Change, Creator Admin User, and Notes.
- **Reservations Table**: Active order/cart stock reservations with SKU, Quantity Reserved, Order Reference link, and Created Timestamp.

---

## 16. Orders Management & Workflow

### Order Directory (`/orders`)
- **Multi-Filter Table**: Order Number, Customer Name & Email, Order Date, Total Amount (`₹`), Order Status Badge (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`), Payment Status Badge, Shipment Status Badge, and View Details link.
- **Filter Bar**: Status tab pills (`All`, `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), Search bar (order #, email, phone), Date range boundaries.

### Order Details View (`/orders/[id]`)
- **Header Actions**: Dynamic Order Status Shift dropdown button showing ONLY valid state transitions based on the backend state machine.
- **Order Summary Grid**:
  - **Line Items Table**: Product Thumbnail, SKU, Name & Variant, Unit Price, Quantity, Line Total.
  - **Customer & Addresses Box**: Customer Profile link, Shipping Address card, Billing Address card.
  - **Financial Summary Box**: Subtotal, Discount Amount, Shipping Fee, Tax Amount, Grand Total.
  - **Status History Timeline Stream**: Chronological audit list showing previous status, new status, timestamp, actor staff name, and admin reason/notes.
  - **Linked Records Cards**: Associated Payments, Shipments, Invoices, Returns, and Refunds cards.

### Order Cancellation Action
- Triggered via Status dropdown when selecting `CANCELLED`.
- Confirmation modal prompts for Cancellation Reason notes.
- Automatically releases held inventory items back to stock on hand (`POST /api/v1/admin/orders/:id/status`).

---

## 17. Shipments & Fulfillment Dispatch

### Fulfillment & Shipment View (`/shipments`, `/shipments/[id]`)
- **Shipments Table**: Shipment Reference ID, Order Number link, Carrier Name (e.g., `FedEx`, `Bluedart`, `Delhivery`), Tracking Number, Tracking URL link, Shipment Status Badge (`PENDING`, `SHIPPED`, `DELIVERED`), and Shipped Date.
- **Create Shipment Modal (`/orders/[id]` or `/shipments`)**:
  - Carrier input dropdown/text.
  - Tracking Number input.
  - Tracking URL input.
  - Items Checkbox List: Select unfulfilled order items and quantities to package in this shipment.
  - Submits to `POST /api/v1/admin/fulfillment`.
- **Status Shift Action**: Update tracking status dropdown (`PENDING` → `SHIPPED` → `DELIVERED`), automatically advancing parent order status to `DELIVERED` when delivery completes.

---

## 18. Payments & Financial Gateway Logs (`/payments`, `/payments/[id]`)

- **Read-Only Oversight View**: Table listing Payment ID, Order Number link, Payment Provider (e.g., `Razorpay`, `Stripe`, `COD`), Amount, Currency, Payment Status Badge (`PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`), and Created Date.
- **Payment Details Modal**: Displays raw provider transaction ID, authorization/capture timestamps, and gateway transaction attempt log table (`payment_transactions`).
- **Security Rule**: Payment statuses are strictly read-only and cannot be manually edited via text fields.

---

## 19. Invoices & Billing Metadata (`/invoices`)

- **Invoices Table**: Invoice Number (e.g., `INV-2026-0001`), Order Number link, Customer Email, Issue Date, Total Amount, Tax Amount, Discount Amount, and Status.
- **Invoice Overview & Print View**: Dedicated printable invoice summary card formatted with AIRAVÉ letterhead, company billing details, shipping address, line item breakdown, tax details, and print/download button.

---

## 20. Customer Management & Address Book (`/customers`, `/customers/[id]`)

### Customer Directory (`/customers`)
- **Table View**: Customer Name, Email, Phone, Status Badge (`ACTIVE`, `SUSPENDED`, `BLOCKED`), Email Verified Pill, Phone Verified Pill, Lifetime Order Count, and Registration Date.
- **Search & Filters**: Search by Name, Email, or Phone; Filter by Status (`ACTIVE`, `SUSPENDED`, `BLOCKED`).

### Customer Profile View (`/customers/[id]`)
- **Profile Overview**: Avatar, Full Name, Email, Phone, Verification badges, Last Login timestamp.
- **Metrics Cards**: Lifetime Value (LTV in `₹`) and Total Completed Orders Count.
- **Saved Address Book Grid**: Cards showing Default Shipping and Billing addresses with full street, city, state, postal code, and country details.
- **Order History Stream**: Table listing customer's recent orders with status badges and quick view links.
- **Account Status Action**: Toggle dropdown (`ACTIVE`, `SUSPENDED`, `BLOCKED`) with confirmation dialog.
- **Security Rule**: Customer password hashes and authentication tokens are strictly excluded from display.

---

## 21. Promotional Coupons & Discounts (`/coupons`, `/coupons/new`, `/coupons/[id]`)

- **Coupons Directory Table**: Code Badge (uppercase e.g. `WELCOME10`), Description, Discount Type (`PERCENTAGE`, `FIXED_AMOUNT`), Discount Value, Minimum Order Amount, Usage Limit vs Used Count, Validity Period (`Starts At` - `Expires At`), and Active Toggle Switch.
- **Coupon Create / Edit Form**:
  - Code string input (auto-uppercased).
  - Discount Type dropdown (`PERCENTAGE` vs `FIXED_AMOUNT`).
  - Discount Value number input.
  - Minimum Order Amount & Maximum Discount Amount optional number inputs.
  - Total Usage Limit & Per-User Usage Limit number inputs.
  - Validity Start Date & Expiration Date pickers.
  - Active Toggle (`isActive`).
- **Scope Restriction Drawer**: Multi-select modal allowing restriction of coupon usage to specific products (`coupon_products`) or categories (`coupon_categories`).
- **Usage History Table**: Recent customer usage log showing Customer Name, Order Number, Discount Amount applied, and Timestamp.

---

## 22. Reviews & Content Moderation (`/reviews`)

- **Review Moderation Table**: Product Thumbnail & Title, Customer Name, Star Rating (1 to 5 stars display), Review Title & Body, Verified Purchase Badge, Publication Status Switch (`isPublished`), Attached Photo Gallery previews, and Delete Action.
- **Filters**: Rating dropdown (1-5 stars), Published status (`Published`, `Unpublished`), Search by product name or customer email.
- **Moderation Actions**: Instant toggle switch for `isPublished` (`PATCH /api/v1/admin/reviews/:id/publish`); Soft-delete confirmation modal (`DELETE /api/v1/admin/reviews/:id`).

---

## 23. Returns Management (`/returns`, `/returns/[id]`)

- **Return Requests Directory**: Table listing Return ID, Order Number link, Customer Email, Reason Badge (`DEFECTIVE`, `WRONG_ITEM`, `NOT_AS_DESCRIBED`, `SIZE_ISSUE`, `CHANGE_OF_MIND`), Status Badge (`REQUESTED`, `APPROVED`, `RECEIVED`, `INSPECTED`, `REFUNDED`, `REJECTED`), and Requested Date.
- **Return Details & Inspection Page**:
  - Customer Note & Return Reason breakdown.
  - Returned Items List: Order item name, SKU, returned quantity, and condition notes.
  - Status Transition Actions: Action buttons for return inspection workflow (`Approve Return`, `Mark Received`, `Complete Inspection`, `Reject Return`).
  - Admin Notes text area for internal inspection remarks.

---

## 24. Refunds & Financial Adjustment Processing (`/refunds`, `/refunds/[id]`)

- **Refund Ledger Table**: Refund ID, Order Number link, Return ID link, Refund Amount (`₹`), Status Badge (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), Provider Reference ID, Reason, and Processed Date.
- **Process Refund Modal (`/returns/[id]` or `/refunds`)**:
  - Order ID & Return ID reference.
  - Refund Amount number input.
  - Refund Reason text input.
  - Action confirmation button calling `POST /api/v1/admin/returns/refunds`.
  - Automatically updates parent order status to `REFUNDED` (full refund) or `PARTIALLY_REFUNDED`.

---

## 25. Admin Staff User Administration (`/admin-users`)

- **Staff Users Table**: Avatar/Initials, Full Name, Email, Assigned Roles Badges (e.g. `SUPER_ADMIN`, `CATALOG_MANAGER`), Status Pill (`ACTIVE`, `SUSPENDED`, `BLOCKED`), Last Login Date, and Edit/Status Actions.
- **Create / Edit Staff User Modal**: Form for Email, Password (create only), First Name, Last Name, Phone, Status, and Role Checkboxes.
- **Privilege Escalation Guard**: Non-`SUPER_ADMIN` staff users cannot view or assign `SUPER_ADMIN` roles or edit `SUPER_ADMIN` accounts.
- **Status Shift Action**: `PATCH /api/v1/admin/admin-users/:id/status`.

---

## 26. Roles & Permission Matrix UI (`/roles`, `/roles/[id]`)

- **Roles List**: Role Name, Slug, Description, Staff Users Count, and System Role Badge (`isSystem`).
- **Interactive Permission Matrix Grid (`/roles/new`, `/roles/[id]`)**:
  - Displays system permissions grouped by domain in a clean responsive grid table.
  - Domain rows (e.g. `Products`, `Orders`, `Inventory`, `Customers`, `Coupons`, `Audit Logs`).
  - Permission Checkboxes for granular actions (`read`, `create`, `update`, `delete`, `moderate`).
  - "Select All for Domain" and "Deselect All" convenience toggles.
  - Submits role updates via `POST` / `PUT /api/v1/admin/roles/:id`.

| Module | View | Create | Edit | Delete | Special Actions |
|---|:---:|:---:|:---:|:---:|---|
| **Products** | `[x]` | `[x]` | `[x]` | `[x]` | Archive |
| **Orders** | `[x]` | `[-]` | `[x]` | `[-]` | Update Status |
| **Inventory** | `[x]` | `[-]` | `[x]` | `[-]` | Stock Adjust |
| **Customers** | `[x]` | `[-]` | `[x]` | `[-]` | Status Shift |
| **Coupons** | `[x]` | `[x]` | `[x]` | `[-]` | Scope Restrictions |
| **Reviews** | `[x]` | `[-]` | `[-]` | `[x]` | Moderation Toggle |
| **Audit Logs**| `[x]` | `[-]` | `[-]` | `[-]` | Read Only |

---

## 27. System Audit Logs Inspection (`/audit-logs`)

- **Read-Only Audit Trail Table**: Timestamp, Actor Staff User Name & Email, Action Badge (e.g. `PRODUCT_UPDATE`, `STOCK_ADJUSTMENT`, `STATUS_CHANGE`), Entity Type (e.g. `Order`, `Product`, `User`), Entity ID link, IP Address, and View Payload button.
- **Expandable Payload Drawer**: Displays formatted JSON diff comparing `oldValues` and `newValues` with sensitive key redactions (`[REDACTED]`).
- **Filter Controls**: Filter by Entity Type, Actor Staff User, Action type, and Date range.
- **Immutability Guarantee**: Audit logs are 100% read-only. No create, edit, or delete endpoints exist.

---

## 28. Search, Filtering, and Sorting System

- **Debounced Instant Search**: All search input fields feature a 300ms debounce before dispatching API requests.
- **Server-Side URL Serialization**: Filter parameters are synchronized with browser URL search parameters (`?search=foo&status=ACTIVE&page=1&limit=10&sortBy=createdAt&sortOrder=desc`) allowing shareable admin views and browser history navigation.
- **Reset Filters Button**: One-click action restoring default query state.

---

## 29. Data Tables & Pagination Architecture

- **Reusable Component**: Built using TanStack React Table (`@tanstack/react-table`).
- **Server-Side Pagination**: Pagination bar showing current page, total items count, items per page selector (`10`, `25`, `50`, `100`), and Previous/Next buttons.
- **Server-Side Sorting**: Clicking table headers toggles ascending/descending sort parameters (`sortBy`, `sortOrder`).
- **Loading & Empty States**: Integrated skeleton row shimmer loaders during data fetching; clean empty state illustration with action button when 0 items match.

---

## 30. Forms, Validation, and UX Feedback

- **Form Framework**: React Hook Form combined with Zod schemas matching backend API validation rules.
- **Real-Time Field Validation**: Inline error messages displayed below inputs on blur or change.
- **Form State Guard**: Submit buttons display a loading spinner and are disabled during active API mutations.
- **Unsaved Changes Warning**: Navigating away from dirty forms triggers a confirmation dialog ("You have unsaved changes. Are you sure you want to leave?").
- **Notification Feedback**: Sonner toast notifications display clear success (green tick) or error (red alert) messages upon API completion.

---

## 31. API Integration & Query Client Architecture

- **Axios HTTP Client (`lib/apiClient.ts`)**:
  - Base URL configured from environment variable `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:5000/api/v1`).
  - Automatic `Authorization: Bearer <token>` header injection via request interceptors.
  - Global error response interceptor parsing standard backend error structures (`{ success: false, error: { code, message, details } }`).
- **TanStack React Query Patterns**:
  - Query keys organized by domain tuple (e.g. `['admin', 'products', { page, limit, search }]`).
  - Automatic cache invalidation (`queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })`) after successful mutations.

---

## 32. State Management Architecture

- **Server State**: Managed by TanStack React Query (cached server data, loading flags, error objects).
- **Authentication & RBAC State**: React Context (`AuthContext`) wrapping the app tree, providing `user`, `permissions`, `isAuthenticated`, `login()`, and `logout()`.
- **UI & Modal State**: Local component state (`useState`) or URL query parameters for transient filters and drawer toggles.
- **Form State**: Managed locally by React Hook Form.

---

## 33. Responsive Design & Mobile Breakpoints

- **Desktop (`>= 1280px`)**: Full sidebar layout, multi-column KPI grids (4 columns), expanded data tables with all metadata columns.
- **Tablet (`768px - 1279px`)**: Collapsed sidebar icon rail, 2-column KPI grids, scrollable horizontal tables with sticky action columns.
- **Mobile (`< 768px`)**: Slide-over drawer navigation, 1-column card stack layout, mobile filter sheet modals, compact action buttons.

---

## 34. Design System & Visual Token Palette

- **Color Palette**: Strictly monochrome and neutral dark/light palette adhering to AIRAVÉ design guidelines.
  - Primary Background: Dark Mode (`#09090B` / `#18181B`) | Light Mode (`#FFFFFF` / `#F4F4F5`).
  - Card & Table Surfaces: Dark (`#18181B`) | Light (`#FAFAFA`).
  - Borders: Neutral Dark (`#27272A`) | Neutral Light (`#E4E4E7`).
  - Text: Primary (`#FAFAFA` / `#09090B`) | Muted (`#A1A1AA` / `#71717A`).
  - Accents & Status Badges: Neutral monochrome pills with distinct status borders (no bright yellow/amber or starburst sparkles).
- **Typography**: Inter / Outfit sans-serif font stack.
- **Components**: Radix UI primitives styled with Tailwind CSS v4.

---

## 35. Accessibility (a11y) Standards

- **Keyboard Navigation**: Full keyboard tab order across sidebar, headers, tables, form fields, and modals.
- **Screen Reader Support**: Accessible ARIA labels (`aria-label`, `aria-expanded`, `aria-describedby`) on icon buttons, drawer toggles, and modal dialogs.
- **Focus Management**: Modal dialogs trap focus inside open overlays and restore focus to the trigger button upon closing.
- **Status Contrast**: Status badges use high-contrast text and dual icon-text indicators rather than color alone.

---

## 36. Security & Route Guard Controls

- **Route Middleware**: Next.js middleware checking session tokens for `/dashboard`, `/products`, `/orders`, `/admin-users`, etc.
- **Token Handling**: Tokens transmitted exclusively over HTTPS Bearer headers and never logged in analytics or client trace logs.
- **XSS & Injection Protection**: React JSX auto-escaping for user-submitted input; Zod payload sanitization before submission.
- **Client-Side Authorization Reality**: Frontend permission guards treat client-side state as untrusted; all security enforcement resides in backend middleware.

---

## 37. Frontend Testing & Quality Assurance

- **Framework**: Vitest (`vitest`) and React Testing Library (`@testing-library/react`).
- **Test Scenarios**:
  1. Protected route redirection when unauthenticated.
  2. Permission-based component rendering and button disabling.
  3. Form validation error rendering on invalid input.
  4. Stock adjustment business modal calculation and submit payload.
  5. Order status dropdown filtering based on allowed state transitions.
  6. Data table sorting, searching, and pagination page changes.

---

## 38. User Scenarios & Acceptance Criteria Matrix

### User Story 1 — Executive Dashboard & Operational Oversight (Priority: P1)
- **Given** an authenticated admin staff member, **When** navigating to `/dashboard`, **Then** the system displays real-time KPI cards, low-stock warning feed, recent orders table, and audit trail stream populated from `GET /api/v1/admin/dashboard`.
- **Independent Test**: Log in as admin and verify dashboard metrics, low-stock warnings, and date range filters update correctly.

### User Story 2 — Catalog & Product Administration (Priority: P1)
- **Given** a staff user with `products:read` and `products:create` permissions, **When** accessing `/products/new` and submitting valid product details, **Then** the product is created via `POST /api/v1/admin/products` and listed in the catalog directory.
- **Independent Test**: Fill the product creation form and verify primary category assignment, price formatting, and status pill rendering.

### User Story 3 — Stock Adjustment & Inventory Operations (Priority: P1)
- **Given** an inventory manager with `inventory:adjust` permission, **When** opening the stock adjustment modal on `/inventory` and selecting movement type `PURCHASE` with `+50` units, **Then** stock on hand updates accurately and a movement log entry is generated.
- **Given** a stock adjustment resulting in negative stock, **When** submitting the form, **Then** the UI blocks submission and displays a `ValidationError` toast.
- **Independent Test**: Attempt both valid and negative stock adjustments in the modal to verify input guards and API payload structure.

### User Story 4 — Order Processing & State Machine Workflow (Priority: P1)
- **Given** an order in `PROCESSING` status, **When** an admin with `orders:update_status` permission views `/orders/[id]`, **Then** the status dropdown displays only valid transitions (`SHIPPED`, `CANCELLED`) and rejects illegal shifts (e.g., `PENDING`).
- **Given** an order status shift to `CANCELLED`, **When** confirmed, **Then** the system updates order status, logs transition notes in history timeline, and releases held stock back to inventory.
- **Independent Test**: Transition an order through its state machine and verify status timeline stream updates.

### User Story 5 — Role & Permission Matrix Management (Priority: P2)
- **Given** a `SUPER_ADMIN` user, **When** navigating to `/roles/[id]`, **Then** the interactive permission grid allows checking/unchecking domain permissions and saves changes via `PUT /api/v1/admin/roles/:id`.
- **Given** a non-`SUPER_ADMIN` user, **When** viewing roles, **Then** `SUPER_ADMIN` role modification controls are disabled.
- **Independent Test**: Edit a custom role's permission checkboxes and verify request payload structure.

---

## 39. REQUIRES BACKEND API Items

*All required endpoints have been fully implemented in the backend phase (`/api/v1/admin/*`).*  
**None. Zero missing backend API items.**

---

## 40. REQUIRES DATABASE CHANGE Items

*All required database models, fields, enums, and relationships exist in `backend/prisma/schema.prisma` and `DATABASE_DESIGN.md`.*  
**None. Zero missing database change items.**
