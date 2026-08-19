# Data Model & UI State Architecture: Admin Panel Frontend

**Feature**: Admin Panel Frontend (`specs/004-admin-panel-frontend`)  
**Date**: 2026-08-19

## 1. Core Data Models & API Envelopes

### Standard API Response Envelopes
All API client requests expect standard JSON responses matching backend formatters:

```typescript
// Single Item / Operation Response Envelope
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Paginated List Response Envelope
export interface ApiPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

---

## 2. Frontend Domain Types & Interfaces

### Staff User & Authentication State
```typescript
export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
  lastLoginAt: string | null;
}

export interface AuthState {
  user: AdminUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### Dashboard Analytics Metrics
```typescript
export interface DashboardMetrics {
  grossRevenue: number;
  totalOrders: number;
  todayOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReturns: number;
  pendingRefunds: number;
  activeCustomersCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    actorName: string;
    createdAt: string;
  }>;
}
```

### Product Catalog Entities
```typescript
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  careInstructions: string | null;
  basePrice: number;
  comparePrice: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
  primaryCategoryId: string;
  primaryCategory?: { id: string; name: string };
  categories?: Array<{ id: string; name: string }>;
  collections?: Array<{ id: string; name: string }>;
  images?: Array<{ id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }>;
  variants?: AdminVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel: number;
  isActive: boolean;
  isDefault: boolean;
  attributes: Record<string, string>; // e.g. { Size: "M", Color: "Black" }
}
```

### Inventory Balance & Adjustment Payload
```typescript
export interface InventoryBalance {
  variantId: string;
  sku: string;
  barcode: string | null;
  productName: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StockAdjustmentPayload {
  variantId: string;
  movementType: 'PURCHASE' | 'ADJUSTMENT' | 'DAMAGE' | 'LOSS' | 'RETURN';
  quantityChange: number; // e.g. +50 or -5
  notes?: string;
}
```

### Order & State Machine Entities
```typescript
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  shippingAddress: any;
  billingAddress: any;
  items: Array<{
    id: string;
    sku: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;
  }>;
  statusHistory?: Array<{
    id: string;
    oldStatus: string | null;
    newStatus: string;
    changedBy: string | null;
    reason: string | null;
    createdAt: string;
  }>;
  createdAt: string;
}
```

### Return Request & Refund Entities
```typescript
export interface AdminReturn {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  status: 'REQUESTED' | 'APPROVED' | 'RECEIVED' | 'INSPECTED' | 'REFUNDED' | 'REJECTED';
  reason: string;
  customerNote: string | null;
  adminNote: string | null;
  items: Array<{
    id: string;
    sku: string;
    productName: string;
    quantity: number;
  }>;
  requestedAt: string;
}

export interface ProcessRefundPayload {
  orderId: string;
  returnId?: string;
  paymentId?: string;
  amount: number;
  reason: string;
}
```

---

## 3. UI State Transitions & Matrix

### Order Status Transition Rules
The UI order status dropdown strictly enforces valid transitions defined in the backend state machine:

```
PENDING ──> CONFIRMED ──> PROCESSING ──> SHIPPED ──> DELIVERED
   │            │               │
   └────────────┴───────────────┴──> CANCELLED (Triggers Inventory Stock Release)
                                │
                                └──> REFUNDED / PARTIALLY_REFUNDED
```
