export type BannerTargetType = 'NONE' | 'PRODUCT' | 'CATEGORY' | 'URL';

export interface GeneralSettings {
  name: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  currency: string;
  defaultLanguage: string;
  timezone: string;
  maintenanceMode: boolean;
}

export interface HeaderAnnouncementBar {
  enabled: boolean;
  text: string;
  link?: string;
}

export interface HeaderSettings {
  announcementBar: HeaderAnnouncementBar;
  searchVisible: boolean;
  wishlistVisible: boolean;
  cartVisible: boolean;
  accountVisible: boolean;
}

export interface ContactSettings {
  phone: string;
  secondaryPhone?: string;
  email: string;
  supportEmail?: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  workingHours: string;
  googleMapsUrl?: string;
}

export interface SocialPlatformConfig {
  enabled: boolean;
  url: string;
}

export interface SocialSettings {
  instagram: SocialPlatformConfig;
  facebook: SocialPlatformConfig;
  youtube: SocialPlatformConfig;
  twitter: SocialPlatformConfig;
  linkedin: SocialPlatformConfig;
  pinterest: SocialPlatformConfig;
  whatsapp: SocialPlatformConfig;
}

export interface FooterLinkItem {
  label: string;
  url: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLinkItem[];
}

export interface FooterSettings {
  description: string;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  showNewsletter: boolean;
  linkGroups: FooterLinkGroup[];
  copyrightText: string;
  showPaymentMethods: boolean;
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  defaultOgImage: string;
  faviconUrl: string;
  robots: string;
}

export type HomepageSectionType =
  | 'HERO'
  | 'BRAND_BANNER'
  | 'CATEGORY_GRID'
  | 'PRODUCT_GRID'
  | 'FEATURED_PRODUCTS'
  | 'NEW_ARRIVALS'
  | 'BEST_SELLERS'
  | 'TRENDING_PRODUCTS'
  | 'SALE_PRODUCTS'
  | 'EDITORIAL_SHOWCASE'
  | 'CUSTOMER_REVIEWS'
  | 'NEWSLETTER';

export interface HomepageSection {
  id: string;
  sectionKey: string;
  sectionType: HomepageSectionType | string;
  title?: string | null;
  subtitle?: string | null;
  displayOrder: number;
  isEnabled: boolean;
  config: {
    limit?: number;
    selectionMode?: 'MANUAL' | 'LATEST' | 'BEST_SELLING' | 'TRENDING' | 'FEATURED' | 'SALE';
    selectedProductIds?: string[];
    selectedCategoryIds?: string[];
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  desktopImageUrl: string;
  mobileImageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  targetType: BannerTargetType;
  targetProductId?: string | null;
  targetCategoryId?: string | null;
  displayOrder: number;
  isEnabled: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  targetProduct?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  targetCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
