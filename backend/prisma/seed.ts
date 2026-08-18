import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Seed Roles
  const roles = [
    { name: "CUSTOMER", description: "AIRAVE customer" },
    { name: "ADMIN", description: "AIRAVE administrator" },
    { name: "SUPER_ADMIN", description: "AIRAVE super administrator" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log("Roles seeded successfully.");

  // Seed Attributes
  const attributes = [
    {
      name: "Color",
      slug: "color",
      isVariantAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 1,
    },
    {
      name: "Size",
      slug: "size",
      isVariantAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 2,
    },
    {
      name: "Fabric",
      slug: "fabric",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 3,
    },
    {
      name: "Fit",
      slug: "fit",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 4,
    },
    {
      name: "Pattern",
      slug: "pattern",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 5,
    },
    {
      name: "Neck Type",
      slug: "neck-type",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 6,
    },
    {
      name: "Sleeve Type",
      slug: "sleeve-type",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 7,
    },
    {
      name: "Age Group",
      slug: "age-group",
      isVariantAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 8,
    },
    {
      name: "Waist",
      slug: "waist",
      isVariantAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 9,
    },
  ];

  for (const attr of attributes) {
    await prisma.attribute.upsert({
      where: { slug: attr.slug },
      update: {
        name: attr.name,
        isVariantAttribute: attr.isVariantAttribute,
        isFilterable: attr.isFilterable,
        isVisible: attr.isVisible,
        sortOrder: attr.sortOrder,
      },
      create: attr,
    });
  }
  console.log("Attributes seeded successfully.");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
