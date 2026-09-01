import { StorefrontSettingsResponse } from "@/types/settings";
import { dedupedFetch } from "@/lib/fetchCache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettingsResponse = {
  store: {
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
  home: {
    sections: [
      { id: "sec-1", sectionKey: "hero_banner", sectionType: "HERO", title: "SPRING / SUMMER '26", subtitle: "MONOCHROME ESSENTIALS", displayOrder: 1, isEnabled: true, config: {} },
      { id: "sec-2", sectionKey: "brand_banner", sectionType: "BRAND_BANNER", displayOrder: 2, isEnabled: true, config: {} },
      { id: "sec-3", sectionKey: "new_arrivals", sectionType: "NEW_ARRIVALS", title: "NEW ARRIVALS", subtitle: "Fresh from the atelier", displayOrder: 3, isEnabled: true, config: { limit: 6, selectionMode: "LATEST" } },
      { id: "sec-4", sectionKey: "curated_collections", sectionType: "CURATED_COLLECTIONS", displayOrder: 4, isEnabled: true, config: {} },
      { id: "sec-5", sectionKey: "category_grid", sectionType: "CATEGORY_GRID", title: "BROWSE BY DRESS STYLE", displayOrder: 5, isEnabled: true, config: {} },
      { id: "sec-6", sectionKey: "editorial_showcase", sectionType: "EDITORIAL_SHOWCASE", title: "HIGH-FASHION EDITORIAL", displayOrder: 6, isEnabled: true, config: {} },
      { id: "sec-7", sectionKey: "top_selling", sectionType: "TOP_SELLING", title: "TOP SELLING", subtitle: "Most requested items", displayOrder: 7, isEnabled: true, config: { limit: 6, selectionMode: "BEST_SELLING" } },
      { id: "sec-8", sectionKey: "recommendations", sectionType: "RECOMMENDATIONS", title: "RECOMMENDED FOR YOU", displayOrder: 8, isEnabled: true, config: {} },
      { id: "sec-9", sectionKey: "customer_reviews", sectionType: "CUSTOMER_REVIEWS", title: "OUR HAPPY CUSTOMERS", displayOrder: 9, isEnabled: true, config: {} },
      { id: "sec-10", sectionKey: "newsletter", sectionType: "NEWSLETTER", title: "STAY UP TO DATE ABOUT OUR LATEST OFFERS", displayOrder: 10, isEnabled: true, config: {} },
    ],
    banners: [],
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

/**
 * Fetches Storefront Settings with in-flight request deduplication.
 */
export async function getStorefrontSettingsApi(): Promise<StorefrontSettingsResponse> {
  return dedupedFetch("storefront_settings", async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/storefront`, {
        next: { revalidate: 30, tags: ["settings", "storefront-settings"] },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data) {
          return data.data as StorefrontSettingsResponse;
        }
      }
    } catch (error) {
      console.warn("Storefront Settings API fetch warning (using default fallback settings):", error);
    }

    return DEFAULT_STOREFRONT_SETTINGS;
  });
}
