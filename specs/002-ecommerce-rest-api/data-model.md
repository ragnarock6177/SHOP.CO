# Data Model & DTO Mapping: REST API Layer

This document details the mapping between API DTOs (Data Transfer Objects), Zod Validation Schemas, and the 48 Prisma models defined in [`backend/prisma/schema.prisma`](file:///d:/CS-Next/backend/prisma/schema.prisma).

---

## 1. Authentication & User DTOs

### `UserResponseDTO`
Excludes `passwordHash` / `password_hash`.
```typescript
interface UserResponseDTO {
  id: string;
  firebaseUid?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DEACTIVATED";
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### `UserAddressDTO`
```typescript
interface UserAddressDTO {
  id: string;
  type: "BILLING" | "SHIPPING";
  firstName: string;
  lastName?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phone?: string | null;
  isDefault: boolean;
}
```

---

## 2. Catalog & Product DTOs

### `ProductListResponseDTO`
```typescript
interface ProductListResponseDTO {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  basePrice?: number | null;
  compareAtPrice?: number | null;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  primaryImage?: string | null;
  categories: { id: string; name: string; slug: string; isPrimary: boolean }[];
}
```

### `ProductDetailResponseDTO`
Includes variants, media gallery, static attributes, and stock status.
```typescript
interface ProductDetailResponseDTO extends ProductListResponseDTO {
  description?: string | null;
  careInstructions?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  images: { id: string; imageUrl: string; altText?: string | null; sortOrder: number; isPrimary: boolean }[];
  videos: { id: string; videoUrl: string; thumbnailUrl?: string | null; title?: string | null }[];
  attributes: { attributeName: string; value: string; colorHex?: string | null }[];
  variants: VariantResponseDTO[];
}
```

### `VariantResponseDTO`
```typescript
interface VariantResponseDTO {
  id: string;
  sku: string;
  barcode?: string | null;
  variantName?: string | null;
  price: number;
  compareAtPrice?: number | null;
  weightGrams?: number | null;
  isDefault: boolean;
  isActive: boolean;
  stockAvailable: number; // calculated: quantityOnHand - quantityReserved
  attributes: { attributeSlug: string; valueSlug: string; value: string }[];
}
```

---

## 3. Cart & Wishlist DTOs

### `CartResponseDTO`
```typescript
interface CartResponseDTO {
  id: string;
  userId?: string | null;
  guestToken?: string | null;
  status: "ACTIVE" | "CONVERTED" | "ABANDONED" | "EXPIRED";
  subtotal: number;
  totalQuantity: number;
  items: {
    id: string;
    variantId: string;
    productName: string;
    variantName?: string | null;
    sku: string;
    unitPrice: number;
    quantity: number;
    itemTotal: number;
    imageUrl?: string | null;
  }[];
}
```

---

## 4. Order & Checkout DTOs

### `CreateOrderInputDTO`
```typescript
interface CreateOrderInputDTO {
  items: { variantId: string; quantity: number }[];
  shippingAddress: {
    firstName: string;
    lastName?: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode?: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName?: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode?: string;
    phone?: string;
  };
  couponCode?: string;
  customerNotes?: string;
}
```

### `OrderResponseDTO`
```typescript
interface OrderResponseDTO {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  customerEmail?: string | null;
  placedAt?: string | null;
  shippingAddress?: UserAddressDTO | null;
  billingAddress?: UserAddressDTO | null;
  items: {
    id: string;
    sku: string;
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
  shipments?: { id: string; status: string; carrier?: string | null; trackingNumber?: string | null }[];
}
```
