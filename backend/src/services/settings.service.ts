import prisma from "../lib/prisma.js";

// Default Fallback Settings if database Lookups return empty
const DEFAULT_SETTINGS: Record<string, any> = {
  general: {
    name: "AIRAVÉ",
    description: "Luxury High-Fashion Streetwear & Contemporary Apparel",
    logoUrl: "/images/logo.svg",
    faviconUrl: "/favicon.ico",
    currency: "INR",
    defaultLanguage: "en",
    timezone: "Asia/Kolkata",
    maintenanceMode: false,
  },
  header: {
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
  contact: {
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
  social: {
    instagram: { enabled: true, url: "https://instagram.com/airave" },
    facebook: { enabled: true, url: "https://facebook.com/airave" },
    youtube: { enabled: true, url: "https://youtube.com/@airave" },
    twitter: { enabled: true, url: "https://x.com/airave" },
    linkedin: { enabled: false, url: "" },
    pinterest: { enabled: true, url: "https://pinterest.com/airave" },
    whatsapp: { enabled: true, url: "https://wa.me/919876543210" },
  },
  footer: {
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
  seo: {
    siteTitle: "AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel",
    siteDescription: "Discover minimalist streetwear, oversized tailoring, and monochrome luxury silhouettes.",
    keywords: ["streetwear", "luxury fashion", "monochrome", "airave", "menswear"],
    defaultOgImage: "https://airave.com/og-image.jpg",
    faviconUrl: "/favicon.ico",
    robots: "index, follow",
  },
  filters: {
    maxPrice: 500,
    enableCategoryFilter: true,
    enablePriceFilter: true,
    enableColorFilter: true,
    enableSizeFilter: true,
    enableDressStyleFilter: true,
    availableColors: [
      { name: "Green", hex: "#00C12B" },
      { name: "Red", hex: "#F50606" },
      { name: "Yellow", hex: "#F5DD06" },
      { name: "Orange", hex: "#F57906" },
      { name: "Cyan", hex: "#06CAF5" },
      { name: "Blue", hex: "#063AF5" },
      { name: "Purple", hex: "#7D06F5" },
      { name: "Pink", hex: "#F506A4" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
    ],
    availableSizes: [
      "XX-Small",
      "X-Small",
      "Small",
      "Medium",
      "Large",
      "X-Large",
      "XX-Large",
      "3X-Large",
    ],
    dressStyles: [
      { name: "Casual", slug: "casual" },
      { name: "Formal", slug: "formal" },
      { name: "Party", slug: "party" },
      { name: "Gym", slug: "gym" },
    ],
  },
  brand_marquee: [
    { name: "VERSACE", isBrand: true },
    { name: "PREMIUM HEAVYWEIGHT COTTON", isBrand: false },
    { name: "GUCCI", isBrand: true },
    { name: "FREE WORLDWIDE EXPRESS SHIPPING", isBrand: false },
    { name: "PRADA", isBrand: true },
    { name: "ETHICALLY CRAFTED ATELIER", isBrand: false },
    { name: "NIKE", isBrand: true },
    { name: "30-DAY COMPLIMENTARY RETURNS", isBrand: false },
    { name: "ZARA", isBrand: true },
    { name: "CALVIN KLEIN", isBrand: true },
  ],
};

export class SettingsService {
  /**
   * Helper: Retrieve all key-value settings from DB as a single object.
   */
  static async getAllSettings(): Promise<Record<string, any>> {
    const settings = await prisma.storeSetting.findMany();
    const map: Record<string, any> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  }

  /**
   * Helper: Update or insert a setting group by key.
   */
  static async setSettingGroup(
    key: string,
    category: string,
    value: any
  ): Promise<any> {
    const existing = await prisma.storeSetting.findUnique({
      where: { key },
    });

    if (existing) {
      const updated = await prisma.storeSetting.update({
        where: { key },
        data: { value, category },
      });
      return updated.value;
    }

    const created = await prisma.storeSetting.create({
      data: { key, category, value },
    });
    return created.value;
  }

  /**
   * Build complete public payload for GET /api/v1/settings/storefront
   */
  static async getStorefrontSettingsPayload(): Promise<Record<string, any>> {
    // 1. Load Store Settings key-values
    const allSettings = await this.getAllSettings();

    // 2. Fetch enabled Homepage Sections sorted by displayOrder
    const rawSections = await prisma.homepageSection.findMany({
      where: { isEnabled: true },
      orderBy: { displayOrder: "asc" },
    });

    const sections = rawSections.map((sec) => ({
      id: sec.id,
      sectionKey: sec.sectionKey,
      sectionType: sec.sectionType,
      title: sec.title,
      subtitle: sec.subtitle,
      displayOrder: sec.displayOrder,
      isEnabled: sec.isEnabled,
      config: sec.config || {},
    }));

    // 3. Fetch active Banners sorted by displayOrder
    const now = new Date();
    const rawBanners = await prisma.banner.findMany({
      where: {
        isEnabled: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { displayOrder: "asc" },
      include: {
        targetProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            compareAtPrice: true,
            images: {
              take: 1,
              select: { imageUrl: true },
            },
            variants: {
              take: 10,
              select: {
                variantAttributeValues: {
                  select: {
                    attributeValue: {
                      select: { value: true, attribute: { select: { slug: true } } },
                    },
                  },
                },
              },
            },
          },
        },
        targetCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    const banners = rawBanners.map((ban) => {
      let targetSlug: string | null = null;
      if (ban.targetType === "PRODUCT" && ban.targetProduct) {
        targetSlug = ban.targetProduct.slug;
      } else if (ban.targetType === "CATEGORY" && ban.targetCategory) {
        targetSlug = ban.targetCategory.slug;
      }

      let hotspotProduct: any = null;
      if (ban.targetProduct) {
        const tp = ban.targetProduct;
        const image =
          tp.images && tp.images.length > 0
            ? tp.images[0].imageUrl
            : ban.desktopImageUrl;

        const sizesSet = new Set<string>();
        if (tp.variants) {
          tp.variants.forEach((v: any) => {
            v.variantAttributeValues?.forEach((vav: any) => {
              if (vav.attributeValue?.attribute?.slug === "size") {
                sizesSet.add(vav.attributeValue.value);
              }
            });
          });
        }
        const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ["S", "M", "L", "XL"];

        hotspotProduct = {
          id: tp.id,
          name: tp.name,
          slug: tp.slug,
          price: tp.basePrice ? Number(tp.basePrice) : 260,
          compareAtPrice: tp.compareAtPrice ? Number(tp.compareAtPrice) : null,
          image,
          sizes,
        };
      }

      return {
        id: ban.id,
        title: ban.title,
        subtitle: ban.subtitle,
        desktopImageUrl: ban.desktopImageUrl,
        mobileImageUrl: ban.mobileImageUrl || ban.desktopImageUrl,
        buttonText: ban.buttonText,
        buttonUrl: ban.buttonUrl,
        targetType: ban.targetType,
        targetProductId: ban.targetProductId,
        targetCategoryId: ban.targetCategoryId,
        targetSlug,
        hotspotProduct,
        displayOrder: ban.displayOrder,
        isEnabled: ban.isEnabled,
      };
    });

    return {
      store: allSettings.general || DEFAULT_SETTINGS.general,
      header: allSettings.header || DEFAULT_SETTINGS.header,
      home: {
        sections,
        banners,
        brandMarquee: allSettings.brand_marquee || DEFAULT_SETTINGS.brand_marquee,
      },
      contact: allSettings.contact || DEFAULT_SETTINGS.contact,
      social: allSettings.social || DEFAULT_SETTINGS.social,
      footer: allSettings.footer || DEFAULT_SETTINGS.footer,
      seo: allSettings.seo || DEFAULT_SETTINGS.seo,
      filters: allSettings.filters || DEFAULT_SETTINGS.filters,
    };
  }
}
