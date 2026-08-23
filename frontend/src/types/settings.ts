export type BannerTargetType = 'NONE' | 'PRODUCT' | 'CATEGORY' | 'URL';

export interface StorefrontGeneralSettings {
  name: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  currency: string;
  defaultLanguage: string;
  timezone: string;
  maintenanceMode: boolean;
}

export interface StorefrontHeaderAnnouncementBar {
  enabled: boolean;
  text: string;
  link?: string;
}

export interface StorefrontHeaderSettings {
  announcementBar: StorefrontHeaderAnnouncementBar;
  searchVisible: boolean;
  wishlistVisible: boolean;
  cartVisible: boolean;
  accountVisible: boolean;
}

export interface StorefrontContactSettings {
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

export interface StorefrontSocialPlatform {
  enabled: boolean;
  url: string;
}

export interface StorefrontSocialSettings {
  instagram: StorefrontSocialPlatform;
  facebook: StorefrontSocialPlatform;
  youtube: StorefrontSocialPlatform;
  twitter: StorefrontSocialPlatform;
  linkedin: StorefrontSocialPlatform;
  pinterest: StorefrontSocialPlatform;
  whatsapp: StorefrontSocialPlatform;
}

export interface StorefrontFooterLink {
  label: string;
  url: string;
}

export interface StorefrontFooterLinkGroup {
  title: string;
  links: StorefrontFooterLink[];
}

export interface StorefrontFooterSettings {
  description: string;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  showNewsletter: boolean;
  linkGroups: StorefrontFooterLinkGroup[];
  copyrightText: string;
  showPaymentMethods: boolean;
}

export interface StorefrontSeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  defaultOgImage: string;
  faviconUrl: string;
  robots: string;
}

export interface StorefrontHomepageSection {
  id: string;
  sectionKey: string;
  sectionType: string;
  title?: string | null;
  subtitle?: string | null;
  displayOrder: number;
  isEnabled: boolean;
  config: Record<string, any>;
}

export interface StorefrontBanner {
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
  targetSlug?: string | null;
  displayOrder: number;
  isEnabled: boolean;
}

export interface StorefrontHomeSettings {
  sections: StorefrontHomepageSection[];
  banners: StorefrontBanner[];
}

export interface StorefrontSettingsResponse {
  store: StorefrontGeneralSettings;
  header: StorefrontHeaderSettings;
  home: StorefrontHomeSettings;
  contact: StorefrontContactSettings;
  social: StorefrontSocialSettings;
  footer: StorefrontFooterSettings;
  seo: StorefrontSeoSettings;
  filters?: any;
}
