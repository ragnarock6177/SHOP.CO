# Data Model Specifications: Storefront Settings & Home Page Customization

**Feature**: `005-storefront-settings`  
**Date**: 2026-08-23  

---

## 1. Prisma Schema Definitions

Add the following ENUM and Models to `backend/prisma/schema.prisma`:

```prisma
// ============================================================
// STOREFRONT SETTINGS & HOMEPAGE CUSTOMIZATION
// ============================================================

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

  updatedByUser User? @relation(fields: [updatedBy], references: [id], onDelete: SetNull)

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

## 2. Updated User, Product, Category Model Relations

Update existing models in `schema.prisma`:
- Add relation to `User`: `storeSettingsUpdated StoreSetting[]`
- Add relation to `Product`: `banners Banner[]`
- Add relation to `Category`: `banners Banner[]`

---

## 3. Zod Validation Schemas (Backend)

### General Settings Schema
```typescript
export const updateGeneralSettingsSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().or(z.string().startsWith("/")),
  faviconUrl: z.string().url().or(z.string().startsWith("/")),
  currency: z.string().length(3).default("INR"),
  defaultLanguage: z.string().length(2).default("en"),
  timezone: z.string().default("Asia/Kolkata"),
  maintenanceMode: z.boolean().default(false),
});
```

### Homepage Section Schema
```typescript
export const updateHomepageSectionSchema = z.object({
  title: z.string().max(255).optional(),
  subtitle: z.string().max(500).optional(),
  displayOrder: z.number().int().min(0),
  isEnabled: z.boolean(),
  config: z.record(z.any()).default({}),
});
```

### Banner Schema
```typescript
export const createBannerSchema = z.object({
  title: z.string().max(255).optional(),
  subtitle: z.string().max(500).optional(),
  desktopImageUrl: z.string().min(1),
  mobileImageUrl: z.string().optional(),
  buttonText: z.string().max(100).optional(),
  buttonUrl: z.string().max(500).optional(),
  targetType: z.enum(["NONE", "PRODUCT", "CATEGORY", "URL"]).default("NONE"),
  targetProductId: z.string().uuid().optional().nullable(),
  targetCategoryId: z.string().uuid().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isEnabled: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});
```

---

## 4. Default Seed Data

Default settings inserted into `store_settings` upon database migration:

- **General**: `key = "general"`, `category = "store"`
- **Header**: `key = "header"`, `category = "layout"`
- **Contact**: `key = "contact"`, `category = "info"`
- **Social**: `key = "social"`, `category = "links"`
- **Footer**: `key = "footer"`, `category = "layout"`
- **SEO**: `key = "seo"`, `category = "marketing"`

Default `homepage_sections` entries:
1. `sec-hero`: `HERO`, order: 1, `isEnabled: true`
2. `sec-new-arrivals`: `NEW_ARRIVALS`, order: 2, `isEnabled: true`
3. `sec-curated-collections`: `CURATED_COLLECTIONS`, order: 3, `isEnabled: true`
4. `sec-category-grid`: `CATEGORY_GRID`, order: 4, `isEnabled: true`
5. `sec-editorial`: `EDITORIAL_SHOWCASE`, order: 5, `isEnabled: true`
6. `sec-top-selling`: `TOP_SELLING`, order: 6, `isEnabled: true`
7. `sec-reviews`: `CUSTOMER_REVIEWS`, order: 7, `isEnabled: true`
8. `sec-newsletter`: `NEWSLETTER`, order: 8, `isEnabled: true`
