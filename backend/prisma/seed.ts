declare const process: any;
import { PrismaClient, ProductStatus, ProductVisibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting fast database seeding...");

  // 1. Seed Roles
  const roles = [
    { name: "CUSTOMER", description: "AIRAVE customer" },
    { name: "ADMIN", description: "AIRAVE administrator" },
    { name: "SUPER_ADMIN", description: "AIRAVE super administrator" },
  ];

  await Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      })
    )
  );
  console.log("Roles seeded successfully.");

  // 2. Seed Attributes
  const attributes = [
    { name: "Color", slug: "color", isVariantAttribute: true, isFilterable: true, isVisible: true, sortOrder: 1 },
    { name: "Size", slug: "size", isVariantAttribute: true, isFilterable: true, isVisible: true, sortOrder: 2 },
    { name: "Fabric", slug: "fabric", isVariantAttribute: false, isFilterable: true, isVisible: true, sortOrder: 3 },
    { name: "Fit", slug: "fit", isVariantAttribute: false, isFilterable: true, isVisible: true, sortOrder: 4 },
  ];

  await Promise.all(
    attributes.map((attr) =>
      prisma.attribute.upsert({
        where: { slug: attr.slug },
        update: {
          name: attr.name,
          isVariantAttribute: attr.isVariantAttribute,
          isFilterable: attr.isFilterable,
          isVisible: attr.isVisible,
          sortOrder: attr.sortOrder,
        },
        create: attr,
      })
    )
  );
  console.log("Attributes seeded successfully.");

  // 3. Seed Categories
  const categoriesData = [
    {
      name: "Casual",
      slug: "casual",
      description: "Everyday comfortable outfits, t-shirts & jeans",
      imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Formal",
      slug: "formal",
      description: "Tailored suits, dress shirts & elegant attire",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Party",
      slug: "party",
      description: "Glamorous evening dresses, jackets & clubwear",
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Gym",
      slug: "gym",
      description: "Activewear, tank tops & athletic bottoms",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const categoryResults = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
        create: cat,
      })
    )
  );

  const categoryMap: Record<string, string> = {};
  categoryResults.forEach((cat) => {
    categoryMap[cat.slug] = cat.id;
  });
  console.log("Categories seeded successfully.");

  // 4. Products (empty - products are dynamically created via Admin panel)
  const products: any[] = [];
  console.log("No static products seeded. Products will be dynamically created via Admin Panel.");

  // 5. Seed Default Storefront Settings
  const defaultSettings = [
    {
      key: "general",
      category: "store",
      value: {
        name: "AIRAVÉ",
        description: "Luxury High-Fashion Streetwear & Contemporary Apparel",
        logoUrl: "/images/logo.svg",
        faviconUrl: "/favicon.ico",
        currency: "INR",
        defaultLanguage: "en",
        timezone: "Asia/Kolkata",
        maintenanceMode: false,
      },
    },
    {
      key: "header",
      category: "layout",
      value: {
        announcementBar: {
          enabled: true,
          text: "COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹5,000",
          link: "/collections/new-arrivals",
        },
        searchVisible: true,
        wishlistVisible: true,
        cartVisible: true,
        accountVisible: true,
      },
    },
    {
      key: "contact",
      category: "info",
      value: {
        phone: "+91 98765 43210",
        secondaryPhone: "+91 98765 43211",
        email: "concierge@airave.com",
        supportEmail: "support@airave.com",
        whatsapp: "+919876543210",
        address: "104 Atelier Boulevard, Fashion District",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400001",
        workingHours: "Mon - Sat: 10:00 AM - 8:00 PM IST",
        googleMapsUrl: "https://maps.google.com/?q=Airave",
      },
    },
    {
      key: "social",
      category: "links",
      value: {
        instagram: { enabled: true, url: "https://instagram.com/airave" },
        facebook: { enabled: true, url: "https://facebook.com/airave" },
        youtube: { enabled: true, url: "https://youtube.com/@airave" },
        twitter: { enabled: true, url: "https://x.com/airave" },
        linkedin: { enabled: false, url: "" },
        pinterest: { enabled: true, url: "https://pinterest.com/airave" },
        whatsapp: { enabled: true, url: "https://wa.me/919876543210" },
      },
    },
    {
      key: "footer",
      category: "layout",
      value: {
        description: "AIRAVÉ represents contemporary minimalist tailoring, combining sculptural silhouettes with unyielding monochrome precision.",
        showContactInfo: true,
        showSocialLinks: true,
        showNewsletter: true,
        linkGroups: [
          {
            title: "SHOP",
            links: [
              { label: "New Arrivals", url: "/collections/new-arrivals" },
              { label: "Bestsellers", url: "/collections/top-selling" },
            ],
          },
        ],
        copyrightText: "© 2026 AIRAVÉ ATELIER. ALL RIGHTS RESERVED.",
        showPaymentMethods: true,
      },
    },
    {
      key: "seo",
      category: "marketing",
      value: {
        siteTitle: "AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel",
        siteDescription: "Discover minimalist streetwear, oversized tailoring, and monochrome luxury silhouettes.",
        keywords: ["streetwear", "luxury fashion", "monochrome", "airave", "menswear"],
        defaultOgImage: "https://airave.com/og-image.jpg",
        faviconUrl: "/favicon.ico",
        robots: "index, follow",
      },
    },
  ];

  await Promise.all(
    defaultSettings.map((setting) =>
      prisma.storeSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, category: setting.category },
        create: setting,
      })
    )
  );
  console.log("Default Store Settings seeded successfully.");

  // 6. Seed Default Homepage Sections
  const defaultSections = [
    { sectionKey: "hero_banner", sectionType: "HERO", title: "SPRING / SUMMER '26", subtitle: "MONOCHROME ESSENTIALS", displayOrder: 1, isEnabled: true, config: {} },
    { sectionKey: "brand_banner", sectionType: "BRAND_BANNER", displayOrder: 2, isEnabled: true, config: {} },
    { sectionKey: "new_arrivals", sectionType: "NEW_ARRIVALS", title: "NEW ARRIVALS", subtitle: "Fresh from the atelier", displayOrder: 3, isEnabled: true, config: { limit: 6, selectionMode: "LATEST" } },
    { sectionKey: "curated_collections", sectionType: "CURATED_COLLECTIONS", displayOrder: 4, isEnabled: true, config: {} },
    { sectionKey: "category_grid", sectionType: "CATEGORY_GRID", title: "BROWSE BY DRESS STYLE", displayOrder: 5, isEnabled: true, config: {} },
    { sectionKey: "editorial_showcase", sectionType: "EDITORIAL_SHOWCASE", title: "HIGH-FASHION EDITORIAL", displayOrder: 6, isEnabled: true, config: {} },
    { sectionKey: "top_selling", sectionType: "TOP_SELLING", title: "TOP SELLING", subtitle: "Most requested items", displayOrder: 7, isEnabled: true, config: { limit: 6, selectionMode: "BEST_SELLING" } },
    { sectionKey: "recommendations", sectionType: "RECOMMENDATIONS", title: "RECOMMENDED FOR YOU", displayOrder: 8, isEnabled: true, config: {} },
    { sectionKey: "customer_reviews", sectionType: "CUSTOMER_REVIEWS", title: "OUR HAPPY CUSTOMERS", displayOrder: 9, isEnabled: true, config: {} },
    { sectionKey: "newsletter", sectionType: "NEWSLETTER", title: "STAY UP TO DATE ABOUT OUR LATEST OFFERS", displayOrder: 10, isEnabled: true, config: {} },
  ];

  await Promise.all(
    defaultSections.map((sec) =>
      prisma.homepageSection.upsert({
        where: { sectionKey: sec.sectionKey },
        update: { sectionType: sec.sectionType, title: sec.title, subtitle: sec.subtitle, displayOrder: sec.displayOrder, isEnabled: sec.isEnabled, config: sec.config },
        create: sec,
      })
    )
  );
  console.log("Default Homepage Sections seeded successfully.");

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
