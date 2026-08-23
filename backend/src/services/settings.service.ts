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
};

export class SettingsService {
  /**
   * Fetch all raw store settings grouped by key.
   */
  static async getAllSettings(): Promise<Record<string, any>> {
    const records = await prisma.storeSetting.findMany();
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const record of records) {
      if (record.value && typeof record.value === "object") {
        settings[record.key] = record.value;
      }
    }

    return settings;
  }

  /**
   * Update a specific settings group key (general, header, contact, social, footer, seo).
   */
  static async updateSettingsGroup(
    key: string,
    category: string,
    value: any,
    userId?: string
  ): Promise<any> {
    const updated = await prisma.storeSetting.upsert({
      where: { key },
      update: {
        value,
        category,
        ...(userId ? { updatedBy: userId } : {}),
      },
      create: {
        key,
        category,
        value,
        ...(userId ? { updatedBy: userId } : {}),
      },
    });

    return updated.value;
  }

  /**
   * Aggregates storefront public settings response (Store, Header, Home, Contact, Social, Footer, SEO).
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
        targetProduct: { select: { id: true, name: true, slug: true } },
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
      },
      contact: allSettings.contact || DEFAULT_SETTINGS.contact,
      social: allSettings.social || DEFAULT_SETTINGS.social,
      footer: allSettings.footer || DEFAULT_SETTINGS.footer,
      seo: allSettings.seo || DEFAULT_SETTINGS.seo,
    };
  }
}
