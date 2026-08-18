# Contract Specification: Prisma Client Database Interface Boundary

This feature is internal database layer infrastructure exposing standard Prisma Client interfaces to Node.js backend services.

## Exposed Interface Surface

- **Package**: `@prisma/client` generated from `backend/prisma/schema.prisma`
- **Exported Prisma Client**: `PrismaClient` instance configured in `backend/src/lib/prisma.ts` (or backend data access layer)
- **Supported Models**: 48 models (`User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `UserAddress`, `Collection`, `Category`, `CollectionCategory`, `Product`, `ProductCategory`, `ProductCollection`, `ProductImage`, `ProductVideo`, `Attribute`, `AttributeValue`, `ProductAttributeValue`, `ProductVariant`, `VariantAttributeValue`, `VariantImage`, `PriceHistory`, `Inventory`, `InventoryMovement`, `InventoryReservation`, `Wishlist`, `WishlistItem`, `Cart`, `CartItem`, `Order`, `OrderAddress`, `OrderItem`, `OrderStatusHistory`, `Shipment`, `ShipmentItem`, `ShipmentStatusHistory`, `Payment`, `PaymentTransaction`, `Invoice`, `ProductReview`, `ReviewImage`, `Coupon`, `CouponProduct`, `CouponCategory`, `CouponUsage`, `Return`, `ReturnItem`, `Refund`, `AuditLog`)
- **Supported Enums**: 16 enums matching `DATABASE_DESIGN.md`
