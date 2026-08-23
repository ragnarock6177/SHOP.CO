import apiClient from "./apiClient";
import {
  GeneralSettings,
  HeaderSettings,
  ContactSettings,
  SocialSettings,
  FooterSettings,
  SeoSettings,
  HomepageSection,
  Banner,
} from "../types/settings";

export async function fetchAdminSettings(): Promise<Record<string, any>> {
  const response = await apiClient.get("/admin/settings");
  return response.data.data;
}

export async function updateGeneralSettings(data: GeneralSettings): Promise<GeneralSettings> {
  const response = await apiClient.put("/admin/settings/general", data);
  return response.data.data;
}

export async function updateHeaderSettings(data: HeaderSettings): Promise<HeaderSettings> {
  const response = await apiClient.put("/admin/settings/header", data);
  return response.data.data;
}

export async function updateContactSettings(data: ContactSettings): Promise<ContactSettings> {
  const response = await apiClient.put("/admin/settings/contact", data);
  return response.data.data;
}

export async function updateSocialSettings(data: SocialSettings): Promise<SocialSettings> {
  const response = await apiClient.put("/admin/settings/social", data);
  return response.data.data;
}

export async function updateFooterSettings(data: FooterSettings): Promise<FooterSettings> {
  const response = await apiClient.put("/admin/settings/footer", data);
  return response.data.data;
}

export async function updateSeoSettings(data: SeoSettings): Promise<SeoSettings> {
  const response = await apiClient.put("/admin/settings/seo", data);
  return response.data.data;
}

export async function updateSettingsGroup(key: string, category: string, value: any): Promise<any> {
  const response = await apiClient.put(`/admin/settings/${key}`, value);
  return response.data.data;
}

export async function updateFilterSettings(data: any): Promise<any> {
  const response = await apiClient.put("/admin/settings/filters", data);
  return response.data.data;
}

// ==========================================
// Homepage Sections API
// ==========================================

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  const response = await apiClient.get("/admin/settings/sections");
  return response.data.data;
}

export async function updateHomepageSection(
  id: string,
  data: Partial<HomepageSection>
): Promise<HomepageSection> {
  const response = await apiClient.put(`/admin/settings/sections/${id}`, data);
  return response.data.data;
}

export async function bulkReorderHomepageSections(
  sections: Array<{ id: string; displayOrder: number; isEnabled?: boolean }>
): Promise<void> {
  await apiClient.put("/admin/settings/sections/reorder", { sections });
}

export async function createHomepageSection(
  data: Partial<HomepageSection>
): Promise<HomepageSection> {
  const response = await apiClient.post("/admin/settings/sections", data);
  return response.data.data;
}

export async function deleteHomepageSection(id: string): Promise<void> {
  await apiClient.delete(`/admin/settings/sections/${id}`);
}

// ==========================================
// Banners API
// ==========================================

export async function fetchBanners(): Promise<Banner[]> {
  const response = await apiClient.get("/admin/settings/banners");
  return response.data.data;
}

export async function createBanner(data: Partial<Banner>): Promise<Banner> {
  const response = await apiClient.post("/admin/settings/banners", data);
  return response.data.data;
}

export async function updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
  const response = await apiClient.put(`/admin/settings/banners/${id}`, data);
  return response.data.data;
}

export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/admin/settings/banners/${id}`);
}
