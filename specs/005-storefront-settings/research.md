# Research & Architecture Decisions: Storefront Settings & Home Page Customization

**Feature**: `005-storefront-settings`  
**Date**: 2026-08-23  
**Status**: Completed  

---

## 1. Storage Architecture: Relational vs Key-Value vs Hybrid

### Decision
Adopt a **Hybrid Database Model** using Prisma with PostgreSQL:
1. `StoreSetting`: Key-value JSON storage table (`key`, `value` JSON, `category`) for singleton setting groups (`general`, `header`, `contact`, `social`, `footer`, `seo`).
2. `HomepageSection`: Dedicated relational table (`id`, `sectionKey`, `sectionType`, `title`, `subtitle`, `displayOrder`, `isEnabled`, `config` JSON) to enable high-performance indexing, sorting, and section toggling.
3. `Banner`: Dedicated relational table (`id`, `title`, `subtitle`, `desktopImageUrl`, `mobileImageUrl`, `buttonText`, `buttonUrl`, `targetType`, `targetProductId`, `targetCategoryId`, `displayOrder`, `isEnabled`, `startsAt`, `endsAt`) with direct foreign key constraints to `Product` and `Category`.

### Rationale
- Storing global settings as JSON objects grouped by category (`general`, `contact`, etc.) avoids creating 6+ near-empty database tables.
- Storing homepage sections and banners in dedicated relational tables enables database-level sort order (`ORDER BY display_order ASC`), indexing on active status, direct foreign key validation for products/categories (`onDelete: SetNull`), and automatic date window filtering (`startsAt <= NOW() AND endsAt >= NOW()`).

### Alternatives Considered
- *Pure Key-Value Store*: Storing all settings (including banners and homepage section lists) inside a single blob JSON. Rejected because referencing product/category foreign keys becomes brittle, updating banner display order requires whole-blob rewriting, and query efficiency suffers.
- *Strict Relational Model for Every Category*: Creating `GeneralSetting`, `HeaderSetting`, `ContactSetting`, `SocialSetting`, `FooterSetting`, `SeoSetting` tables. Rejected as overengineering—creates schema bloat for simple key-value configuration.

---

## 2. API Design & Public Response Aggregation

### Decision
Consolidate all storefront settings into a **single public GET endpoint**: `GET /api/v1/settings/storefront`.

Admin APIs are scoped cleanly under `/api/v1/admin/settings/...`:
- `GET /api/v1/admin/settings` (Fetch all settings)
- `PUT /api/v1/admin/settings/:group` (Update group settings)
- `GET/POST/PUT/DELETE /api/v1/admin/settings/sections` (Manage dynamic sections)
- `GET/POST/PUT/DELETE /api/v1/admin/settings/banners` (Manage banners)

### Rationale
- The storefront homepage requires general branding, header settings, section ordering, hero banners, footer info, and SEO tags on initial load. Combining them into one endpoint prevents waterfall network calls on page load.
- Scoping admin APIs under existing `/api/v1/admin/...` router pattern preserves permission isolation via `requireAdminAuth` and `requirePermission("settings:manage")`.

---

## 3. Caching & ISR Strategy

### Decision
Use Next.js 14+ **Incremental Static Regeneration (ISR)** with tag-based revalidation:
- Fetch call: `fetch('${API_URL}/settings/storefront', { next: { revalidate: 3600, tags: ['storefront-settings'] } })`.
- On Admin update: Express backend or Next.js API route calls `revalidateTag('storefront-settings')` or returns cache-busting headers (`Cache-Control: no-cache`).

### Rationale
- Settings change infrequently (e.g. daily/weekly), whereas product views happen thousands of times per minute.
- ISR serves cached HTML/JSON in < 15ms, eliminating database query overhead on storefront traffic while allowing instant updates when admins save changes.

---

## 4. Homepage Dynamic Component Architecture

### Decision
Implement a registry-based **Dynamic Component Renderer** (`<HomepageSectionRenderer />`) mapping `sectionType` strings to React components.

```typescript
const SECTION_REGISTRY: Record<string, React.ComponentType<any>> = {
  HERO: HeroBanner,
  BRAND_BANNER: BrandBanner,
  CATEGORY_GRID: CategoryGrid,
  PRODUCT_GRID: ProductGrid,
  FEATURED_PRODUCTS: FeaturedProducts,
  NEW_ARRIVALS: NewArrivals,
  BEST_SELLERS: TopSelling,
  TRENDING_PRODUCTS: TrendingProducts,
  SALE_PRODUCTS: SaleProducts,
  EDITORIAL_SHOWCASE: EditorialShowcase,
  CUSTOMER_REVIEWS: CustomerReviews,
  NEWSLETTER: NewsletterBanner,
};
```

### Rationale
- Decouples component rendering logic from layout ordering.
- Adding a new section type in the future only requires implementing the component and adding 1 entry to `SECTION_REGISTRY`. No changes to `page.tsx` routing or database schemas.

---

## 5. Product & Category Selection Resolution

### Decision
For product sections, support 6 selection modes resolved by backend services:
- `MANUAL`: Query `products` WHERE `id IN (selectedProductIds)`.
- `LATEST`: Query `products` ORDER BY `createdAt DESC` LIMIT `limit`.
- `BEST_SELLING`: Query `products` ordered by order volume or default rank.
- `TRENDING`: Query `products` ORDER BY `reviewsCount DESC` or view metrics.
- `FEATURED`: Query `products` WHERE `status = 'ACTIVE'` AND `visibility = 'PUBLIC'` with limit.
- `SALE`: Query `products` WHERE `compareAtPrice > basePrice`.

### Rationale
- Leverages existing catalog indexes without duplicating product fields into section JSON.
- If a manually selected product is deleted, the query gracefully skips the missing ID without breaking page rendering.
