import prisma from "../lib/prisma.js";
import { UserStatus } from "@prisma/client";

async function flushAndSeed() {
  console.log("==================================================");
  console.log("🗑️  AIRAVÉ DATABASE FLUSH & SEED ROUTINE");
  console.log("==================================================");

  // 1. Identify Admin Users to preserve
  const adminUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: "admin@airave.com" },
        { userRoles: { some: { role: { name: { in: ["ADMIN", "SUPER_ADMIN"] } } } } },
      ],
    },
    select: { id: true, email: true },
  });

  const adminUserIds = adminUsers.map((u) => u.id);
  console.log(`🔒 Preserving ${adminUsers.length} Admin User(s): ${adminUsers.map((u) => u.email).join(", ")}`);

  // 2. Perform Atomic Flush in Transaction
  console.log("🧹 Flushing transactional, order, inventory, product, and non-admin data...");
  await prisma.$transaction(
    async (tx) => {
      // Inventory & Reservations
      await tx.inventoryReservation.deleteMany();
      await tx.inventoryMovement.deleteMany();
      await tx.inventory.deleteMany();
      await tx.priceHistory.deleteMany();

      // Orders, Invoices, Payments, Shipments, Returns, Refunds
      await tx.orderAddress.deleteMany();
      await tx.orderStatusHistory.deleteMany();
      await tx.paymentTransaction.deleteMany();
      await tx.payment.deleteMany();
      await tx.invoice.deleteMany();
      await tx.shipmentItem.deleteMany();
      await tx.shipment.deleteMany();
      await tx.returnItem.deleteMany();
      await tx.return.deleteMany();
      await tx.refund.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();

      // Carts, Wishlists, Coupons
      await tx.cartItem.deleteMany();
      await tx.cart.deleteMany();
      await tx.wishlist.deleteMany();
      await tx.couponUsage.deleteMany();
      await tx.coupon.deleteMany();

      // Products, Variants, Images, Reviews
      await tx.variantAttributeValue.deleteMany();
      await tx.variantImage.deleteMany();
      await tx.productVariant.deleteMany();
      await tx.productImage.deleteMany();
      await tx.productVideo.deleteMany();
      await tx.productCategory.deleteMany();
      await tx.productCollection.deleteMany();
      await tx.productReview.deleteMany();
      await tx.product.deleteMany();

      // Collections, Categories, Attributes & Values
      await tx.collection.deleteMany();
      await tx.category.deleteMany();
      await tx.attributeValue.deleteMany();
      await tx.attribute.deleteMany();

      // Audit logs
      await tx.auditLog.deleteMany();

      // Non-admin users & addresses
      await tx.userAddress.deleteMany({
        where: { userId: { notIn: adminUserIds } },
      });
      await tx.userRole.deleteMany({
        where: { userId: { notIn: adminUserIds } },
      });
      await tx.user.deleteMany({
        where: { id: { notIn: adminUserIds } },
      });
    },
    { maxWait: 20000, timeout: 60000 }
  );

  console.log("✅ All non-admin data successfully flushed.");

  // 3. Ensure Standard Roles Exist
  console.log("🌱 Seeding standard system roles...");
  const roles = [
    { name: "SUPER_ADMIN", description: "Full administrative and system management authority" },
    { name: "ADMIN", description: "Store operations, catalog, orders, and inventory administrator" },
    { name: "CUSTOMER", description: "Registered storefront customer" },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const created = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roleMap[r.name] = created.id;
  }

  // 4. Ensure Super Admin User exists and is linked
  const superAdminRole = roleMap["SUPER_ADMIN"];
  const adminEmail = "admin@airave.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      status: UserStatus.ACTIVE,
      firstName: "Super",
      lastName: "Admin",
    },
    create: {
      email: adminEmail,
      firstName: "Super",
      lastName: "Admin",
      status: UserStatus.ACTIVE,
      firebaseUid: "firebase_admin_master",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: superAdminRole,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: superAdminRole,
    },
  });
  console.log(`👤 Super Admin verified: ${admin.email} (ID: ${admin.id})`);

  // 5. Seed Core Standard Attributes & Attribute Values (Pants, T-Shirts, Shirts)
  console.log("🎨 Seeding apparel attributes (Color, Size, Fit, Fabric, Sleeve)...");
  
  // Color Attribute
  await prisma.attribute.create({
    data: {
      name: "Color",
      slug: "color",
      isVariantAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 1,
      values: {
        create: [
          { value: "Black", slug: "black", colorHex: "#000000", sortOrder: 1 },
          { value: "White", slug: "white", colorHex: "#FFFFFF", sortOrder: 2 },
          { value: "Olive Green", slug: "olive-green", colorHex: "#556B2F", sortOrder: 3 },
          { value: "Navy Blue", slug: "navy-blue", colorHex: "#000080", sortOrder: 4 },
          { value: "Charcoal Grey", slug: "charcoal-grey", colorHex: "#36454F", sortOrder: 5 },
          { value: "Khaki Beige", slug: "khaki-beige", colorHex: "#C3B091", sortOrder: 6 },
          { value: "Cocoa Brown", slug: "cocoa-brown", colorHex: "#4A3728", sortOrder: 7 },
          { value: "Sage", slug: "sage", colorHex: "#9EA792", sortOrder: 8 },
        ],
      },
    },
  });

  // Size Attribute (Tops & Pants)
  await prisma.attribute.create({
    data: {
      name: "Size",
      slug: "size",
      isVariantAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 2,
      values: {
        create: [
          { value: "S", slug: "s", sortOrder: 1 },
          { value: "M", slug: "m", sortOrder: 2 },
          { value: "L", slug: "l", sortOrder: 3 },
          { value: "XL", slug: "xl", sortOrder: 4 },
          { value: "XXL", slug: "xxl", sortOrder: 5 },
          { value: "28", slug: "28", sortOrder: 6 },
          { value: "30", slug: "30", sortOrder: 7 },
          { value: "32", slug: "32", sortOrder: 8 },
          { value: "34", slug: "34", sortOrder: 9 },
          { value: "36", slug: "36", sortOrder: 10 },
          { value: "38", slug: "38", sortOrder: 11 },
        ],
      },
    },
  });

  // Fit Attribute
  await prisma.attribute.create({
    data: {
      name: "Fit",
      slug: "fit",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 3,
      values: {
        create: [
          { value: "Oversized Boxy", slug: "oversized-boxy", sortOrder: 1 },
          { value: "Relaxed Straight", slug: "relaxed-straight", sortOrder: 2 },
          { value: "Slim Fit", slug: "slim-fit", sortOrder: 3 },
          { value: "Regular Classic", slug: "regular-classic", sortOrder: 4 },
          { value: "Wide Leg", slug: "wide-leg", sortOrder: 5 },
        ],
      },
    },
  });

  // Fabric Attribute
  await prisma.attribute.create({
    data: {
      name: "Fabric",
      slug: "fabric",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 4,
      values: {
        create: [
          { value: "100% Heavyweight Cotton (240 GSM)", slug: "100-heavyweight-cotton", sortOrder: 1 },
          { value: "100% Pure French Linen", slug: "100-pure-linen", sortOrder: 2 },
          { value: "Linen-Cotton Blend", slug: "linen-cotton-blend", sortOrder: 3 },
          { value: "Stretch Cotton Twill", slug: "stretch-cotton-twill", sortOrder: 4 },
          { value: "Heavyweight French Terry", slug: "heavyweight-french-terry", sortOrder: 5 },
        ],
      },
    },
  });

  // Sleeve Type Attribute
  await prisma.attribute.create({
    data: {
      name: "Sleeve Type",
      slug: "sleeve-type",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 5,
      values: {
        create: [
          { value: "Half Sleeve Drop-Shoulder", slug: "half-sleeve-drop-shoulder", sortOrder: 1 },
          { value: "Short Sleeve", slug: "short-sleeve", sortOrder: 2 },
          { value: "Full Sleeve", slug: "full-sleeve", sortOrder: 3 },
        ],
      },
    },
  });

  // 6. Seed Pants, T-Shirts, and Shirts Categories
  console.log("📁 Seeding apparel categories (T-Shirts, Shirts, Pants)...");
  const categories = [
    {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Premium heavyweight tees, oversized drop-shoulder and classic streetwear essentials",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
      sortOrder: 1,
    },
    {
      name: "Shirts",
      slug: "shirts",
      description: "Tailored oxford button-downs, casual pure linen, and structured overshirts",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      sortOrder: 2,
    },
    {
      name: "Pants",
      slug: "pants",
      description: "Pleated formal trousers, relaxed cargos, chinos, and modern straight-leg bottoms",
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
      sortOrder: 3,
    },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  // 7. Seed Pants, T-Shirts, and Shirts Collections
  console.log("✨ Seeding apparel collections...");
  const collections = [
    {
      name: "Oversized T-Shirts",
      slug: "oversized-t-shirts",
      description: "Drop-shoulder heavyweight 240+ GSM tees with boxy modern silhouettes",
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
      sortOrder: 1,
    },
    {
      name: "Linen & Casual Shirts",
      slug: "linen-casual-shirts",
      description: "Breathable pure linen and relaxed camp-collar button downs",
      imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
      sortOrder: 2,
    },
    {
      name: "Pants & Trousers",
      slug: "pants-trousers",
      description: "Everyday pleated trousers, wide-leg pants and premium chinos",
      imageUrl: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=800",
      sortOrder: 3,
    },
    {
      name: "New Season Drops",
      slug: "new-season-drops",
      description: "Fresh seasonal releases across tees, shirts, and versatile bottomwear",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
      sortOrder: 4,
    },
  ];

  for (const col of collections) {
    await prisma.collection.create({ data: col });
  }

  console.log("==================================================");
  console.log("🎉 DATABASE FLUSH & CLEAN SEED COMPLETE!");
  console.log("==================================================");
}

flushAndSeed()
  .catch((err) => {
    console.error("Flush script failed with error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
