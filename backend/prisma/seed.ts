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

  // 4. Seed 30 Products concurrently
  const products = [
    {
      name: "ONE LIFE GRAPHIC T-SHIRT",
      slug: "prod-one-life",
      shortDescription: "100% Organic Heavyweight Streetwear Cotton",
      description: "This graphic t-shirt is perfect for any occasion. Crafted from soft, breathable organic cotton, it offers superior comfort and relaxed streetwear style.",
      productType: "T-Shirt",
      basePrice: 260,
      compareAtPrice: 300,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Gradient Graphic T-shirt",
      slug: "prod-gradient",
      shortDescription: "Vibrant Art Streetwear Printed Tee",
      description: "Featuring an eye-catching gradient art design on premium combed cotton for everyday street style.",
      productType: "T-Shirt",
      basePrice: 145,
      compareAtPrice: 185,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Polo with Tipping Details",
      slug: "prod-polo-tipping",
      shortDescription: "Textured Cotton Pique Polo Shirt",
      description: "Classic polo shirt enhanced with contrasting collar tipping details and double-stitched sleeve cuffs.",
      productType: "Polo",
      basePrice: 180,
      compareAtPrice: 242,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Black Striped T-Shirt",
      slug: "prod-black-striped",
      shortDescription: "Classic Monochrome Striped Cotton Tee",
      description: "Timeless black and white striped tee crafted from ultra-soft cotton fabric.",
      productType: "T-Shirt",
      basePrice: 130,
      compareAtPrice: 160,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Skinny Fit Denim Jeans",
      slug: "prod-skinny-jeans",
      shortDescription: "Stretch Denim Slim Fit Jeans",
      description: "Modern skinny fit denim jeans featuring subtle whiskering and flexible stretch denim fabric.",
      productType: "Jeans",
      basePrice: 240,
      compareAtPrice: 280,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Checkered Button-Down Shirt",
      slug: "prod-checkered-shirt",
      shortDescription: "Brushed Flannel Casual Checkered Shirt",
      description: "Warm and cozy brushed flannel checkered shirt with button-down collar and chest pocket.",
      productType: "Shirt",
      basePrice: 180,
      compareAtPrice: 220,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Sleeve Striped Athletic Tee",
      slug: "prod-sleeve-striped",
      shortDescription: "Active Athletic Moisture-Wicking Tee",
      description: "Engineered for movement with contrast sleeve stripes and breathable moisture-wicking technology.",
      productType: "Activewear",
      basePrice: 130,
      compareAtPrice: 160,
      categorySlug: "gym",
      imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Vertical Striped Linen Shirt",
      slug: "prod-vertical-striped-linen",
      shortDescription: "Lightweight Breathable Linen Blend Shirt",
      description: "Elegant vertical striped linen blend shirt perfect for smart casual and warm weather wear.",
      productType: "Shirt",
      basePrice: 212,
      compareAtPrice: 250,
      categorySlug: "formal",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Courage Oversized Graphic Tee",
      slug: "prod-courage-graphic",
      shortDescription: "Heavyweight Graphic Streetwear Tee",
      description: "Statement streetwear tee featuring bold back typography and a dropped shoulder relaxed fit.",
      productType: "T-Shirt",
      basePrice: 145,
      compareAtPrice: 195,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Loose Fit Bermuda Denim Shorts",
      slug: "prod-bermuda-shorts",
      shortDescription: "Relaxed Fit Denim Streetwear Shorts",
      description: "Comfortable loose-fit denim shorts designed for casual summer outings and relaxed fits.",
      productType: "Shorts",
      basePrice: 80,
      compareAtPrice: 110,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Faded Vintage Skinny Jeans",
      slug: "prod-faded-skinny-jeans",
      shortDescription: "Vintage Wash Slim Fit Stretch Denim",
      description: "Authentic vintage wash denim with hand-finished fading and high-recovery stretch memory.",
      productType: "Jeans",
      basePrice: 210,
      compareAtPrice: 260,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Classic Oxford Tailored Blazer",
      slug: "prod-oxford-blazer",
      shortDescription: "Tailored Single-Breasted Formal Blazer",
      description: "Impeccably tailored single-breasted suit blazer made from premium wool-blend fabric with satin lining.",
      productType: "Blazer",
      basePrice: 450,
      compareAtPrice: 550,
      categorySlug: "formal",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Midnight Black Tuxedo Suit",
      slug: "prod-midnight-tuxedo",
      shortDescription: "Formal Evening Tuxedo with Satin Lapel",
      description: "Sophisticated black tuxedo suit featuring peak satin lapels, structured shoulders, and tailored trousers.",
      productType: "Suit",
      basePrice: 680,
      compareAtPrice: 820,
      categorySlug: "formal",
      imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Premium Silk Blend Dress Shirt",
      slug: "prod-silk-dress-shirt",
      shortDescription: "Smooth Silk Blend Button-Up Formal Shirt",
      description: "Luxurious silk-blend formal shirt with French cuffs and mother-of-pearl buttons.",
      productType: "Shirt",
      basePrice: 320,
      compareAtPrice: 400,
      categorySlug: "formal",
      imageUrl: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Slim Fit Chino Trousers",
      slug: "prod-slim-chino-trousers",
      shortDescription: "Cotton Twill Smart Casual Trousers",
      description: "Versatile slim-fit chino trousers tailored from stretch cotton twill for modern formal styling.",
      productType: "Trousers",
      basePrice: 195,
      compareAtPrice: 240,
      categorySlug: "formal",
      imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Velvet Sparkle Evening Party Blazer",
      slug: "prod-velvet-party-blazer",
      shortDescription: "Plush Velvet Evening Party Blazer",
      description: "Statement velvet party blazer featuring subtle metallic sheen, silk piping, and custom jacquard lining.",
      productType: "Blazer",
      basePrice: 520,
      compareAtPrice: 650,
      categorySlug: "party",
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Satin Gloss Party Dress Shirt",
      slug: "prod-satin-party-shirt",
      shortDescription: "High-Gloss Satin Clubwear Shirt",
      description: "Sleek high-gloss satin shirt designed for nightclub outings and glamorous party attire.",
      productType: "Shirt",
      basePrice: 280,
      compareAtPrice: 350,
      categorySlug: "party",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Sequin Detail Clubwear Jacket",
      slug: "prod-sequin-party-jacket",
      shortDescription: "Bold Sequin Accented Party Jacket",
      description: "Eye-catching party jacket decorated with micro-sequins for maximum night-out sparkle.",
      productType: "Jacket",
      basePrice: 490,
      compareAtPrice: 600,
      categorySlug: "party",
      imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Metallic Gold Accent Party Tee",
      slug: "prod-metallic-gold-tee",
      shortDescription: "Gold Foil Printed Night Out Tee",
      description: "Premium black cotton tee featuring shimmering metallic gold foil graphics.",
      productType: "T-Shirt",
      basePrice: 175,
      compareAtPrice: 220,
      categorySlug: "party",
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Seamless Pro Performance Gym Hoodie",
      slug: "prod-seamless-gym-hoodie",
      shortDescription: "Seamless Thermal Training Hoodie",
      description: "Lightweight seamless performance hoodie with thumbholes and 4-way stretch active knit.",
      productType: "Activewear",
      basePrice: 290,
      compareAtPrice: 360,
      categorySlug: "gym",
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Compression Fit Gym Tank Top",
      slug: "prod-compression-tank",
      shortDescription: "Ergonomic Muscle Fit Gym Tank",
      description: "High-compression workout tank top providing targeted muscle support and quick-dry breathability.",
      productType: "Activewear",
      basePrice: 95,
      compareAtPrice: 130,
      categorySlug: "gym",
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Breathable Athletic Runner Shorts",
      slug: "prod-runner-shorts",
      shortDescription: "Dual-Layer Workout Runner Shorts",
      description: "Dual-layer running shorts with built-in compression liner and zip phone pocket.",
      productType: "Shorts",
      basePrice: 110,
      compareAtPrice: 150,
      categorySlug: "gym",
      imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Thermal Training Sweatpants",
      slug: "prod-thermal-sweatpants",
      shortDescription: "Fleece Lined Athletic Joggers",
      description: "Tapered workout joggers featuring zipped ankle cuffs and thermal fleece lining for outdoor training.",
      productType: "Joggers",
      basePrice: 210,
      compareAtPrice: 270,
      categorySlug: "gym",
      imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Heavyweight Fleece Pullover Hoodie",
      slug: "prod-heavyweight-pullover",
      shortDescription: "450GSM Organic Cotton Fleece Hoodie",
      description: "Ultra-heavyweight 450GSM organic cotton fleece hoodie built for winter warmth and street structure.",
      productType: "Hoodie",
      basePrice: 310,
      compareAtPrice: 380,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Oversized Acid Wash Streetwear Tee",
      slug: "prod-acid-wash-tee",
      shortDescription: "Vintage Acid Washed Oversized Fit Tee",
      description: "Individually acid-washed cotton tee with unique distressed texture and vintage aesthetic.",
      productType: "T-Shirt",
      basePrice: 165,
      compareAtPrice: 210,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Distressed Cargo Streetwear Pants",
      slug: "prod-distressed-cargo-pants",
      shortDescription: "Multi-Pocket Tactical Cargo Pants",
      description: "Streetwear cargo pants equipped with 8 tactical pockets, drawstring cuffs, and heavy cotton twill fabric.",
      productType: "Pants",
      basePrice: 275,
      compareAtPrice: 340,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Double-Breasted Formal Suit Vest",
      slug: "prod-double-breasted-vest",
      shortDescription: "Tailored Wool Blend Waistcoat",
      description: "Classic double-breasted suit vest with adjustable back strap for three-piece formal suits.",
      productType: "Vest",
      basePrice: 225,
      compareAtPrice: 280,
      categorySlug: "formal",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Performance Tech Mesh Gym Tee",
      slug: "prod-tech-mesh-gym-tee",
      shortDescription: "Ultra-Light Aerated Gym Workout Tee",
      description: "Engineered with micro-mesh laser perforations for maximum airflow during high-intensity training.",
      productType: "Activewear",
      basePrice: 125,
      compareAtPrice: 160,
      categorySlug: "gym",
      imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Embroidered Dragon Souvenir Jacket",
      slug: "prod-dragon-souvenir-jacket",
      shortDescription: "Sukajan Satin Souvenir Bomber Jacket",
      description: "Japanese Sukajan style satin bomber jacket decorated with detailed dragon embroidery.",
      productType: "Jacket",
      basePrice: 420,
      compareAtPrice: 520,
      categorySlug: "party",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Raw Indigo Selvedge Denim Jacket",
      slug: "prod-selvedge-denim-jacket",
      shortDescription: "Heavy 14oz Japanese Selvedge Denim",
      description: "Premium 14oz Japanese selvedge denim jacket featuring custom brass hardware and classic trucker silhouette.",
      productType: "Jacket",
      basePrice: 360,
      compareAtPrice: 450,
      categorySlug: "casual",
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800",
    },
  ];

  await Promise.all(
    products.map(async (item) => {
      const categoryId = categoryMap[item.categorySlug];

      const product = await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          shortDescription: item.shortDescription,
          description: item.description,
          productType: item.productType,
          basePrice: item.basePrice,
          compareAtPrice: item.compareAtPrice,
          status: ProductStatus.ACTIVE,
          visibility: ProductVisibility.PUBLIC,
        },
        create: {
          name: item.name,
          slug: item.slug,
          shortDescription: item.shortDescription,
          description: item.description,
          productType: item.productType,
          basePrice: item.basePrice,
          compareAtPrice: item.compareAtPrice,
          currency: "INR",
          status: ProductStatus.ACTIVE,
          visibility: ProductVisibility.PUBLIC,
        },
      });

      // Primary Image
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: item.imageUrl,
          altText: item.name,
          isPrimary: true,
          sortOrder: 1,
        },
      });

      // Category Link
      if (categoryId) {
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: {
              productId: product.id,
              categoryId: categoryId,
            },
          },
          update: { isPrimary: true },
          create: {
            productId: product.id,
            categoryId: categoryId,
            isPrimary: true,
          },
        });
      }
    })
  );

  console.log(`Successfully seeded ${products.length} products concurrently!`);

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
