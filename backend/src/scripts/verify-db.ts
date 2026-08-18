import { PrismaClient, UserStatus, ProductStatus, AddressType, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("==================================================");
  console.log("   AIRAVÉ E-COMMERCE DATABASE VERIFICATION SUITE  ");
  console.log("==================================================\n");

  try {
    // 1. Verify Seed Data
    console.log("[Test 1/6] Verifying Seed Data...");
    const roleCount = await prisma.role.count();
    const attrCount = await prisma.attribute.count();
    console.log(`  -> Found ${roleCount} roles (expected >= 3)`);
    console.log(`  -> Found ${attrCount} attributes (expected >= 9)`);
    if (roleCount < 3 || attrCount < 9) {
      throw new Error("Seed verification failed: Missing roles or attributes.");
    }
    console.log("  ✓ Seed data verification passed.\n");

    // 2. User & Firebase Auth Model Verification
    console.log("[Test 2/6] Verifying User & Firebase Auth Model...");
    const testEmail = `test.verifier.${Date.now()}@airave.com`;
    const testFirebaseUid = `firebase_uid_${Date.now()}`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        firebaseUid: testFirebaseUid,
        firstName: "Test",
        lastName: "User",
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`  -> Created User ID: ${user.id} with Firebase UID: ${user.firebaseUid}`);

    // Verify Citext Case-Insensitive Email Lookup
    const uppercaseEmailMatch = await prisma.user.findUnique({
      where: { email: testEmail.toUpperCase() },
    });
    if (!uppercaseEmailMatch || uppercaseEmailMatch.id !== user.id) {
      throw new Error("CITEXT email lookup failed!");
    }
    console.log("  ✓ User creation & CITEXT case-insensitive lookup passed.\n");

    // 3. Category & Product Taxonomy Verification
    console.log("[Test 3/6] Verifying Catalog Taxonomy & Relations...");
    const category = await prisma.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        slug: `test-cat-${Date.now()}`,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "AIRAVE Luxury Silk Shirt",
        slug: `airave-silk-shirt-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        basePrice: 2999.5000,
        currency: "INR",
        productCategories: {
          create: {
            categoryId: category.id,
            isPrimary: true,
          },
        },
      },
    });
    console.log(`  -> Created Product ID: ${product.id} attached to Category: ${category.name}`);
    console.log("  ✓ Product & Category relational binding passed.\n");

    // 4. Variant, Inventory & Decimal Precision Verification
    console.log("[Test 4/6] Verifying Variant, Inventory & Decimal Precision...");
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `SKU-TEST-${Date.now()}`,
        variantName: "Black / L",
        price: 2999.5000,
        compareAtPrice: 3499.0000,
      },
    });

    const inventory = await prisma.inventory.create({
      data: {
        variantId: variant.id,
        quantityOnHand: 100,
        quantityReserved: 10,
        reorderLevel: 5,
      },
    });

    console.log(`  -> Created Variant SKU: ${variant.sku} with Price: ${variant.price.toString()}`);
    console.log(`  -> Created Inventory Record: Stock On Hand=${inventory.quantityOnHand}, Reserved=${inventory.quantityReserved}`);

    // Verify Decimal numeric equality
    if (variant.price.toNumber() !== 2999.5) {
      throw new Error("Decimal precision mismatch for variant price!");
    }
    console.log("  ✓ Variant & Inventory 1:1 binding and Decimal precision passed.\n");

    // 5. Order, Items & Address Snapshot Verification
    console.log("[Test 5/6] Verifying Order Lifecycle & Address Snapshotting...");
    const orderNumber = `ORD-TEST-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: OrderStatus.PENDING,
        subtotal: 2999.5000,
        shippingAmount: 100.0000,
        taxAmount: 500.0000,
        totalAmount: 3599.5000,
        customerEmail: user.email,
        addresses: {
          create: {
            type: AddressType.SHIPPING,
            firstName: "Test",
            lastName: "User",
            addressLine1: "123 Fashion Street",
            city: "Mumbai",
            state: "Maharashtra",
            postalCode: "400001",
            countryCode: "IN",
          },
        },
        items: {
          create: {
            variantId: variant.id,
            sku: variant.sku,
            productName: product.name,
            variantName: variant.variantName,
            quantity: 1,
            unitPrice: 2999.5000,
            totalAmount: 2999.5000,
          },
        },
      },
      include: {
        addresses: true,
        items: true,
      },
    });

    console.log(`  -> Created Order: ${order.orderNumber} with Total: ${order.totalAmount.toString()}`);
    console.log(`  -> Order Address count: ${order.addresses.length}, Items count: ${order.items.length}`);
    console.log("  ✓ Order snapshotting passed.\n");

    // 6. Cleanup Verification Data
    console.log("[Test 6/6] Cleaning up test records...");
    await prisma.orderAddress.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.inventory.delete({ where: { id: inventory.id } });
    await prisma.productVariant.delete({ where: { id: variant.id } });
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("  ✓ Cleanup complete.\n");

    console.log("==================================================");
    console.log("   ALL DATABASE VERIFICATION TESTS PASSED (100%)  ");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ VERIFICATION TEST FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
