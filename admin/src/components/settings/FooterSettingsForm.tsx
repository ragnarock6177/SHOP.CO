"use client";

import React, { useState } from "react";
import { FooterSettings } from "@/types/settings";
import { updateFooterSettings } from "@/lib/settingsApi";
import { toast } from "@/lib/toast";
import { Save } from "lucide-react";

interface FooterSettingsFormProps {
  initialData?: FooterSettings;
  onSaved?: () => void;
}

export function FooterSettingsForm({ initialData, onSaved }: FooterSettingsFormProps) {
  const [formData, setFormData] = useState<FooterSettings>({
    description: initialData?.description || "AIRAVÉ represents contemporary minimalist tailoring, combining sculptural silhouettes with unyielding monochrome precision.",
    showContactInfo: initialData?.showContactInfo ?? true,
    showSocialLinks: initialData?.showSocialLinks ?? true,
    showNewsletter: initialData?.showNewsletter ?? true,
    linkGroups: initialData?.linkGroups || [
      {
        title: "SHOP",
        links: [
          { label: "New Arrivals", url: "/collections/new-arrivals" },
          { label: "Bestsellers", url: "/collections/top-selling" },
        ],
      },
    ],
    copyrightText: initialData?.copyrightText || "© 2026 AIRAVÉ ATELIER. ALL RIGHTS RESERVED.",
    showPaymentMethods: initialData?.showPaymentMethods ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFooterSettings(formData);
      toast.success("Settings saved", "Footer settings saved successfully!");
      if (onSaved) onSaved();
    } catch (err) {
      toast.apiError(err, "Failed to update footer settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">Footer Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Customize footer blurb, newsletter visibility, copyright notice, and badges</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="footerDescription" className="text-xs font-semibold text-slate-700">
          Footer Brand Blurb
        </label>
        <input
          id="footerDescription"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="AIRAVÉ represents contemporary minimalist tailoring..."
          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="copyrightText" className="text-xs font-semibold text-slate-700">
          Copyright Text <span className="text-rose-500">*</span>
        </label>
        <input
          id="copyrightText"
          type="text"
          value={formData.copyrightText}
          onChange={(e) => setFormData((prev) => ({ ...prev, copyrightText: e.target.value }))}
          placeholder="© 2026 AIRAVÉ ATELIER. ALL RIGHTS RESERVED."
          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          required
        />
      </div>

      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-slate-900 block">Footer Component Visibility</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-md bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Show Contact Information</span>
            <input
              type="checkbox"
              checked={formData.showContactInfo}
              onChange={(e) => setFormData((prev) => ({ ...prev, showContactInfo: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-md bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Show Social Media Links</span>
            <input
              type="checkbox"
              checked={formData.showSocialLinks}
              onChange={(e) => setFormData((prev) => ({ ...prev, showSocialLinks: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-md bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Show Newsletter Signup Form</span>
            <input
              type="checkbox"
              checked={formData.showNewsletter}
              onChange={(e) => setFormData((prev) => ({ ...prev, showNewsletter: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-md bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Show Payment Method Badges</span>
            <input
              type="checkbox"
              checked={formData.showPaymentMethods}
              onChange={(e) => setFormData((prev) => ({ ...prev, showPaymentMethods: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Footer Settings"}</span>
        </button>
      </div>
    </form>
  );
}
