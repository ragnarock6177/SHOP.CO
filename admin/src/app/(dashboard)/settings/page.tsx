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

type SettingsTab =
  | "general"
  | "home"
  | "header"
  | "footer"
  | "contact"
  | "social"
  | "seo"
  | "banners";

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

  const TABS: Array<{ id: SettingsTab; label: string }> = [
    { id: "general", label: "General" },
    { id: "home", label: "Home Page" },
    { id: "header", label: "Header" },
    { id: "footer", label: "Footer" },
    { id: "contact", label: "Contact" },
    { id: "social", label: "Social Media" },
    { id: "seo", label: "SEO" },
    { id: "banners", label: "Banners" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Storefront Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize store branding, homepage sections, banners, contact details, and SEO configuration.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold">Loading Store Settings...</div>
      ) : (
        <div className="pt-2">
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
