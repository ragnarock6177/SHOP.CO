# Implementation Plan: Storefront Settings & Home Page Customization

**Branch**: `005-storefront-settings` | **Date**: 2026-08-23 | **Spec**: [`spec.md`](spec.md)

---

## 1. Repository Analysis & Architectural Grounding

### Existing Infrastructure Summary
- **Backend**: Node.js + Express + TypeScript in `backend/` with `/api/v1` base route. Uses Prisma ORM with PostgreSQL, Zod validation, JWT authentication (`requireAdminAuth`), granular RBAC (`requirePermission`), and standardized JSON responses (`sendSuccess`, `sendError`).
- **Admin Panel**: Next.js App Router in `admin/` using Tailwind CSS, Shadcn UI primitives (`tabs`, `card`, `dialog`, `sheet`, `input`, `button`, `switch`), and Axios `apiClient` with Bearer token authentication. Existing settings route exists at `admin/src/app/(dashboard)/settings/page.tsx` as a placeholder.
- **Storefront**: Next.js 14+ App Router in `frontend/` using Tailwind CSS and Lucide icons. Uses `productApi.ts` with ISR (`next: { revalidate: 60, tags: [...] }`) and graceful fallback mock objects. Homepage in `frontend/src/app/(shop)/page.tsx` renders modular components (`HeroBanner`, `BrandBanner`, `NewArrivals`, `CuratedCollections`, `CategoryGrid`, `EditorialShowcase`, `TopSelling`, `PersonalizedRecommendations`, `CustomerReviews`, `NewsletterBanner`).

---

## 2. Final Architecture Decisions

```text
Admin Panel (/settings)
     │ (Admin CRUD APIs with Bearer Auth & RBAC)
     ▼
Admin Controller & Router (/api/v1/admin/settings/...)
     │ (Zod Schema Validation)
     ▼
Settings & Section Services
     │ (Prisma Client Transactions)
     ▼
PostgreSQL Database (store_settings, homepage_sections, banners)
     │ (Aggregated Public Query Layer)
     ▼
Public Settings Endpoint (GET /api/v1/settings/storefront)
     │ (Next.js ISR Caching & Tag Revalidation)
     ▼
Storefront Homepage (HomepageSectionRenderer + Component Registry)
```

- **Model Reuse**: Reuse existing `Product`, `Category`, `Collection`, `ProductImage`, and `User` models without altering catalog schemas or duplicating entity data.
- **New Models Required**: `StoreSetting` (Key-Value JSON store), `HomepageSection` (Dynamic layout engine), `Banner` (Promotional hero slide & media targets).
- **Service Layer**: Create `settings.service.ts`, `sections.service.ts`, and `banners.service.ts` in `backend/src/services/admin/`.
- **Controller Layer**: Create `settings.controller.ts`, `sections.controller.ts`, `banners.controller.ts`, and `publicSettings.controller.ts` in `backend/src/controllers/`.

---

## 3. Database Implementation Plan

### Schema Additions in `backend/prisma/schema.prisma`

```prisma
enum BannerTargetType {
  NONE
  PRODUCT
  CATEGORY
  URL

  @@map("banner_target_type")
}

model StoreSetting {
  key       String   @id @db.VarChar(100)
  value     Json     @default("{}")
  category  String   @db.VarChar(50)
  updatedBy String?  @map("updated_by") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  updatedByUser User? @relation("StoreSettingsUpdatedBy", fields: [updatedBy], references: [id], onDelete: SetNull)

  @@index([category])
  @@map("store_settings")
}

model HomepageSection {
  id           String   @id @default(uuid()) @db.Uuid
  sectionKey   String   @unique @map("section_key") @db.VarChar(100)
  sectionType  String   @map("section_type") @db.VarChar(50)
  title        String?  @db.VarChar(255)
  subtitle     String?  @db.VarChar(500)
  displayOrder Int      @default(0) @map("display_order")
  isEnabled    Boolean  @default(true) @map("is_enabled")
  config       Json     @default("{}")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  @@index([isEnabled, displayOrder])
  @@map("homepage_sections")
}

model Banner {
  id               String           @id @default(uuid()) @db.Uuid
  title            String?          @db.VarChar(255)
  subtitle         String?          @db.VarChar(500)
  desktopImageUrl  String           @map("desktop_image_url")
  mobileImageUrl   String?          @map("mobile_image_url")
  buttonText       String?          @map("button_text") @db.VarChar(100)
  buttonUrl        String?          @map("button_url") @db.VarChar(500)
  targetType       BannerTargetType @default(NONE) @map("target_type")
  targetProductId  String?          @map("target_product_id") @db.Uuid
  targetCategoryId String?          @map("target_category_id") @db.Uuid
  displayOrder     Int              @default(0) @map("display_order")
  isEnabled        Boolean          @default(true) @map("is_enabled")
  startsAt         DateTime?        @map("starts_at") @db.Timestamptz
  endsAt           DateTime?        @map("ends_at") @db.Timestamptz
  createdAt        DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime         @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  targetProduct  Product?  @relation(fields: [targetProductId], references: [id], onDelete: SetNull)
  targetCategory Category? @relation(fields: [targetCategoryId], references: [id], onDelete: SetNull)

  @@index([isEnabled, displayOrder])
  @@index([startsAt, endsAt])
  @@map("banners")
}
```

---

## 4. Home Page Section Architecture

Each dynamic section follows a hybrid relational + JSON layout contract:
- **`id`**: Unique UUID primary key.
- **`sectionKey`**: Machine key (e.g. `hero_slider`, `new_arrivals_grid`).
- **`sectionType`**: Enum/string discriminator (`HERO`, `BRAND_BANNER`, `CATEGORY_GRID`, `PRODUCT_GRID`, `FEATURED_PRODUCTS`, `NEW_ARRIVALS`, `BEST_SELLERS`, `TRENDING_PRODUCTS`, `SALE_PRODUCTS`, `EDITORIAL_SHOWCASE`, `CUSTOMER_REVIEWS`, `NEWSLETTER`).
- **`title` / `subtitle`**: Optional display headers editable by admin.
- **`displayOrder`**: Integer sequence rank for ordering components.
- **`isEnabled`**: Boolean toggle to show/hide sections instantly.
- **`config`**: JSON payload for type-specific properties (e.g., `{ "limit": 6, "selectionMode": "LATEST", "selectedProductIds": [...] }`).

---

## 5. Banner Implementation Plan

- **Media Handling**: Reuses existing `/api/v1/admin/upload/presign` endpoint for presigned image uploads.
- **Scheduling Logic**: Backend queries query `WHERE isEnabled = true AND (startsAt IS NULL OR startsAt <= NOW()) AND (endsAt IS NULL OR endsAt >= NOW())`.
- **Target Resolution**: When `targetType = 'PRODUCT'`, queries target product slug; when `targetType = 'CATEGORY'`, queries target category slug for frontend routing.

---

## 6. Product and Category Integration

- **Selection Modes for Product Sections**:
  - `MANUAL`: Fetch products by explicit IDs stored in `config.selectedProductIds`.
  - `LATEST`: Fetch newest products ordered by `createdAt DESC`.
  - `BEST_SELLING`: Fetch top items by order volume.
  - `TRENDING`: Fetch highest reviewed/viewed items.
  - `FEATURED`: Fetch active public products marked as featured.
  - `SALE`: Fetch products where `compareAtPrice > basePrice`.
- **Reference Safety**: If a product or category is soft-deleted, foreign keys are set to `NULL` (`onDelete: SetNull`) and excluded from response payloads.

---

## 7. Backend Implementation Plan

### Files to Create in `backend/`
1. `backend/src/validators/settings.validator.ts`: Zod schemas for settings, homepage sections, and banners.
2. `backend/src/services/settings.service.ts`: Data access layer for settings key-values and public storefront settings builder.
3. `backend/src/services/sections.service.ts`: CRUD & reordering logic for homepage sections.
4. `backend/src/services/banners.service.ts`: CRUD & scheduling logic for promotional banners.
5. `backend/src/controllers/settings.controller.ts`: Admin settings controller handlers.
6. `backend/src/controllers/publicSettings.controller.ts`: Public storefront settings handler.
7. `backend/src/routes/settings.routes.ts`: Public route `/api/v1/settings/storefront`.
8. `backend/src/routes/admin/settings.routes.ts`: Admin routes mounted under `/api/v1/admin/settings`.

### Authorization Guards
- Public route `GET /api/v1/settings/storefront`: Unauthenticated.
- Admin routes `/api/v1/admin/settings/*`: Protected with `requireAdminAuth` and `requirePermission("settings:manage")`.

---

## 8. Storefront Settings API Payload Specification

### `GET /api/v1/settings/storefront` Response Format:
```json
{
  "success": true,
  "data": {
    "store": {
      "name": "AIRAVÉ",
      "description": "Luxury High-Fashion Streetwear & Contemporary Apparel",
      "logoUrl": "/images/logo.svg",
      "faviconUrl": "/favicon.ico",
      "currency": "INR",
      "defaultLanguage": "en",
      "timezone": "Asia/Kolkata",
      "maintenanceMode": false
    },
    "header": {
      "announcementBar": {
        "enabled": true,
        "text": "COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹5,000",
        "link": "/collections/new-arrivals"
      },
      "searchVisible": true,
      "wishlistVisible": true,
      "cartVisible": true,
      "accountVisible": true
    },
    "home": {
      "sections": [
        {
          "id": "sec-001",
          "sectionKey": "hero_slider",
          "sectionType": "HERO",
          "title": "SPRING / SUMMER '26",
          "subtitle": "MONOCHROME ESSENTIALS",
          "displayOrder": 1,
          "isEnabled": true,
          "config": {}
        }
      ],
      "banners": []
    },
    "contact": {},
    "social": {},
    "footer": {},
    "seo": {}
  }
}
```

---

## 9. Admin Panel Implementation Plan

### Files to Create / Modify in `admin/`
1. `admin/src/types/settings.ts`: TypeScript interfaces for settings, sections, and banners.
2. `admin/src/lib/settingsApi.ts`: Axios client functions interfacing with settings API.
3. `admin/src/app/(dashboard)/settings/page.tsx`: Main Tabbed Settings screen.
4. `admin/src/components/settings/GeneralSettingsForm.tsx`: General store preferences form.
5. `admin/src/components/settings/HomepageSectionManager.tsx`: Visual section reordering & toggling manager.
6. `admin/src/components/settings/SectionEditDialog.tsx`: Dialog to edit section titles and selection rules.
7. `admin/src/components/settings/BannerManager.tsx`: Banner list, image dropzone, and target picker.
8. `admin/src/components/settings/HeaderSettingsForm.tsx`: Announcement bar and icon visibility form.
9. `admin/src/components/settings/FooterSettingsForm.tsx`: Footer links, copyright, and payment icons form.
10. `admin/src/components/settings/ContactSettingsForm.tsx`: Phone, email, address, working hours form.
11. `admin/src/components/settings/SocialSettingsForm.tsx`: Social media URLs and toggles form.
12. `admin/src/components/settings/SeoSettingsForm.tsx`: Meta tags, OpenGraph images, and robots rules form.

---

## 10. Storefront Implementation Plan

### Files to Create / Modify in `frontend/`
1. `frontend/src/types/settings.ts`: Storefront settings TypeScript types.
2. `frontend/src/lib/settingsApi.ts`: Storefront settings fetch client with Next.js ISR tag revalidation (`tags: ['storefront-settings']`).
3. `frontend/src/components/home/HomepageSectionRenderer.tsx`: Registry-based section component renderer.
4. `frontend/src/app/(shop)/page.tsx`: Refactored homepage consuming settings API and dynamically rendering sections.
5. `frontend/src/components/layout/Header.tsx`: Updated header consuming announcement bar and navigation settings.
6. `frontend/src/components/layout/Footer.tsx`: Updated footer consuming contact, social, and footer settings.

---

## 11. Caching & Revalidation Strategy

- Storefront uses Next.js ISR: `fetch('${API_BASE_URL}/settings/storefront', { next: { revalidate: 3600, tags: ['storefront-settings'] } })`.
- When an admin updates settings, the Express backend sends an invalidation signal or the Next.js revalidation handler triggers `revalidateTag('storefront-settings')`.

---

## 12. Fallback & Safe Degradation Strategy

- **API Failure**: If backend is offline, storefront falls back to hardcoded default settings object without throwing fatal errors.
- **Deleted Category/Product Reference**: Invalid target UUIDs are safely filtered out, defaulting banner buttons or product carousels to fallback catalog queries.
- **Empty Homepage Sections**: Displays default Hero + Category Grid layout if all sections are accidentally disabled.

---

## 13. File-by-File Change List

| File Path | Purpose | Action |
| :--- | :--- | :--- |
| `backend/prisma/schema.prisma` | Add `StoreSetting`, `HomepageSection`, `Banner` models | Modify |
| `backend/src/validators/settings.validator.ts` | Zod validation schemas for settings | Create |
| `backend/src/services/settings.service.ts` | Settings & public payload aggregation service | Create |
| `backend/src/services/sections.service.ts` | Homepage dynamic sections service | Create |
| `backend/src/services/banners.service.ts` | Promotional banners service | Create |
| `backend/src/controllers/settings.controller.ts` | Admin settings API handlers | Create |
| `backend/src/controllers/publicSettings.controller.ts` | Public settings storefront handler | Create |
| `backend/src/routes/settings.routes.ts` | Mount public storefront endpoint | Create |
| `backend/src/routes/admin/settings.routes.ts` | Mount admin management endpoints | Create |
| `backend/src/routes/index.ts` | Register public settings router | Modify |
| `backend/src/routes/admin/index.ts` | Register admin settings router | Modify |
| `admin/src/types/settings.ts` | Admin settings TypeScript contracts | Create |
| `admin/src/lib/settingsApi.ts` | Admin Axios API helpers | Create |
| `admin/src/app/(dashboard)/settings/page.tsx` | Tabbed Settings Container Page | Modify |
| `admin/src/components/settings/*` | Settings forms and section manager components | Create |
| `frontend/src/types/settings.ts` | Storefront settings types | Create |
| `frontend/src/lib/settingsApi.ts` | Storefront settings fetcher with ISR | Create |
| `frontend/src/components/home/HomepageSectionRenderer.tsx` | Dynamic homepage section mapper | Create |
| `frontend/src/app/(shop)/page.tsx` | Dynamic section-driven homepage | Modify |
| `frontend/src/components/layout/Header.tsx` | Dynamic header settings consumer | Modify |
| `frontend/src/components/layout/Footer.tsx` | Dynamic footer settings consumer | Modify |

---

## 14. Phased Implementation Breakdown

```text
Phase 1: Database & Seed Layer
  ├── Task 1.1: Add Prisma schema models and run migration
  └── Task 1.2: Add seed data for default store settings and homepage sections

Phase 2: Backend API & Validation Layer
  ├── Task 2.1: Implement Zod validators (settings.validator.ts)
  ├── Task 2.2: Implement Settings, Sections, and Banners services
  ├── Task 2.3: Implement Admin and Public Settings controllers
  └── Task 2.4: Register API routes in backend router

Phase 3: Admin Panel UI Layer
  ├── Task 3.1: Create settings types and Axios API helper functions
  ├── Task 3.2: Implement Tabbed Settings Page in admin app
  ├── Task 3.3: Implement General, Header, Footer, Contact, Social, SEO forms
  ├── Task 3.4: Implement Homepage Visual Section Manager (reorder, toggle, config)
  └── Task 3.5: Implement Banner Manager & image upload picker

Phase 4: Storefront Integration & Dynamic Rendering Layer
  ├── Task 4.1: Implement storefront settings API fetcher with ISR revalidation
  ├── Task 4.2: Implement HomepageSectionRenderer component
  ├── Task 4.3: Refactor storefront page.tsx to consume dynamic settings
  └── Task 4.4: Connect Header and Footer components to centralized settings

Phase 5: Verification & Testing
  ├── Task 5.1: Verify end-to-end admin configuration to storefront rendering
  └── Task 5.2: Execute quickstart validation scenarios and fallbacks
```
