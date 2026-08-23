import { z } from "zod";

export const updateGeneralSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().min(1, "Logo URL is required"),
  faviconUrl: z.string().min(1, "Favicon URL is required"),
  currency: z.string().length(3).default("INR"),
  defaultLanguage: z.string().length(2).default("en"),
  timezone: z.string().default("Asia/Kolkata"),
  maintenanceMode: z.boolean().default(false),
});

export const updateHeaderSettingsSchema = z.object({
  announcementBar: z.object({
    enabled: z.boolean(),
    text: z.string().max(255),
    link: z.string().optional(),
  }),
  searchVisible: z.boolean().default(true),
  wishlistVisible: z.boolean().default(true),
  cartVisible: z.boolean().default(true),
  accountVisible: z.boolean().default(true),
});

export const updateContactSettingsSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  secondaryPhone: z.string().optional(),
  email: z.string().email("Invalid primary email address"),
  supportEmail: z.string().email("Invalid support email address").optional(),
  whatsapp: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  workingHours: z.string().min(1, "Working hours are required"),
  googleMapsUrl: z.string().optional(),
});

const socialPlatformSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().optional().default(""),
});

export const updateSocialSettingsSchema = z.object({
  instagram: socialPlatformSchema,
  facebook: socialPlatformSchema,
  youtube: socialPlatformSchema,
  twitter: socialPlatformSchema,
  linkedin: socialPlatformSchema,
  pinterest: socialPlatformSchema,
  whatsapp: socialPlatformSchema,
});

const footerLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

const footerLinkGroupSchema = z.object({
  title: z.string().min(1),
  links: z.array(footerLinkSchema),
});

export const updateFooterSettingsSchema = z.object({
  description: z.string().max(500),
  showContactInfo: z.boolean().default(true),
  showSocialLinks: z.boolean().default(true),
  showNewsletter: z.boolean().default(true),
  linkGroups: z.array(footerLinkGroupSchema).default([]),
  copyrightText: z.string().max(255),
  showPaymentMethods: z.boolean().default(true),
});

export const updateSeoSettingsSchema = z.object({
  siteTitle: z.string().min(1).max(255),
  siteDescription: z.string().max(500),
  keywords: z.array(z.string()).default([]),
  defaultOgImage: z.string().optional(),
  faviconUrl: z.string().optional(),
  robots: z.string().default("index, follow"),
});

export const createHomepageSectionSchema = z.object({
  sectionKey: z.string().min(1).max(100),
  sectionType: z.string().min(1).max(50),
  title: z.string().max(255).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isEnabled: z.boolean().default(true),
  config: z.record(z.string(), z.any()).default({}),
});

export const updateHomepageSectionSchema = z.object({
  title: z.string().max(255).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  isEnabled: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

export const bulkReorderSectionsSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int().min(0),
      isEnabled: z.boolean().optional(),
    })
  ),
});

export const createBannerSchema = z.object({
  title: z.string().max(255).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  desktopImageUrl: z.string().min(1, "Desktop image URL is required"),
  mobileImageUrl: z.string().optional().nullable(),
  buttonText: z.string().max(100).optional().nullable(),
  buttonUrl: z.string().max(500).optional().nullable(),
  targetType: z.enum(["NONE", "PRODUCT", "CATEGORY", "URL"]).default("NONE"),
  targetProductId: z.string().uuid().optional().nullable(),
  targetCategoryId: z.string().uuid().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isEnabled: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const updateBannerSchema = createBannerSchema.partial();
