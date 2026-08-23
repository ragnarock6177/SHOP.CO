"use client";

import React, { useState, useEffect } from "react";
import { fetchAdminSettings } from "@/lib/settingsApi";
import { GeneralSettingsForm } from "@/components/settings/GeneralSettingsForm";
import { HeaderSettingsForm } from "@/components/settings/HeaderSettingsForm";
import { ContactSettingsForm } from "@/components/settings/ContactSettingsForm";
import { SocialSettingsForm } from "@/components/settings/SocialSettingsForm";
import { FooterSettingsForm } from "@/components/settings/FooterSettingsForm";
import { SeoSettingsForm } from "@/components/settings/SeoSettingsForm";
import { HomepageSectionManager } from "@/components/settings/HomepageSectionManager";
import { BannerManager } from "@/components/settings/BannerManager";
import {
  Store,
  LayoutGrid,
  Navigation,
  PanelBottom,
  PhoneCall,
  Share2,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general"
  | "home"
  | "header"
  | "footer"
  | "contact"
  | "social"
  | "seo"
  | "banners";

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "general", label: "General", icon: Store },
  { id: "home", label: "Homepage Sections", icon: LayoutGrid },
  { id: "header", label: "Header & Announcement", icon: Navigation },
  { id: "footer", label: "Footer", icon: PanelBottom },
  { id: "contact", label: "Contact Details", icon: PhoneCall },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "seo", label: "SEO & Metadata", icon: Search },
  { id: "banners", label: "Hero Banners", icon: ImageIcon },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminSettings();
      setSettingsData(data);
    } catch (err) {
      console.warn("Could not load initial settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Storefront Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure store branding, announcement bar, homepage sections, promotional banners, contact info, and SEO
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 overflow-x-auto pb-px scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer",
                isActive
                  ? "border-slate-900 text-slate-900 bg-slate-100/70"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-slate-900" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Card Container */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400 shadow-2xs animate-pulse">
          Loading Storefront Settings...
        </div>
      ) : (
        <div className="transition-all">
          {activeTab === "general" && (
            <GeneralSettingsForm initialData={settingsData.general} onSaved={loadAllSettings} />
          )}
          {activeTab === "home" && <HomepageSectionManager />}
          {activeTab === "header" && (
            <HeaderSettingsForm initialData={settingsData.header} onSaved={loadAllSettings} />
          )}
          {activeTab === "footer" && (
            <FooterSettingsForm initialData={settingsData.footer} onSaved={loadAllSettings} />
          )}
          {activeTab === "contact" && (
            <ContactSettingsForm initialData={settingsData.contact} onSaved={loadAllSettings} />
          )}
          {activeTab === "social" && (
            <SocialSettingsForm initialData={settingsData.social} onSaved={loadAllSettings} />
          )}
          {activeTab === "seo" && (
            <SeoSettingsForm initialData={settingsData.seo} onSaved={loadAllSettings} />
          )}
          {activeTab === "banners" && <BannerManager />}
        </div>
      )}
    </div>
  );
}
