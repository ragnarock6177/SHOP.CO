"use client";

import React, { useState } from "react";
import { GeneralSettings } from "@/types/settings";
import { updateGeneralSettings } from "@/lib/settingsApi";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

interface GeneralSettingsFormProps {
  initialData?: GeneralSettings;
  onSaved?: () => void;
}

export function GeneralSettingsForm({ initialData, onSaved }: GeneralSettingsFormProps) {
  const [formData, setFormData] = useState<GeneralSettings>({
    name: initialData?.name || "AIRAVÉ",
    description: initialData?.description || "Luxury High-Fashion Streetwear & Contemporary Apparel",
    logoUrl: initialData?.logoUrl || "/images/logo.svg",
    faviconUrl: initialData?.faviconUrl || "/favicon.ico",
    currency: initialData?.currency || "INR",
    defaultLanguage: initialData?.defaultLanguage || "en",
    timezone: initialData?.timezone || "Asia/Kolkata",
    maintenanceMode: initialData?.maintenanceMode || false,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: keyof GeneralSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateGeneralSettings(formData);
      setMessage({ type: "success", text: "General store settings updated successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update general settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">General Store Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage store identity, default currency, locale, and maintenance status</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-semibold text-slate-700">
            Store Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. AIRAVÉ"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="currency" className="text-xs font-semibold text-slate-700">
            Currency Code <span className="text-rose-500">*</span>
          </label>
          <input
            id="currency"
            type="text"
            value={formData.currency}
            onChange={(e) => handleChange("currency", e.target.value.toUpperCase())}
            placeholder="INR"
            maxLength={3}
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs font-mono uppercase"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-slate-700">
          Store Tagline & Description
        </label>
        <input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Luxury High-Fashion Streetwear & Contemporary Apparel"
          className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="logoUrl" className="text-xs font-semibold text-slate-700">
            Logo Image URL <span className="text-rose-500">*</span>
          </label>
          <input
            id="logoUrl"
            type="text"
            value={formData.logoUrl}
            onChange={(e) => handleChange("logoUrl", e.target.value)}
            placeholder="/images/logo.svg"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="faviconUrl" className="text-xs font-semibold text-slate-700">
            Favicon Image URL <span className="text-rose-500">*</span>
          </label>
          <input
            id="faviconUrl"
            type="text"
            value={formData.faviconUrl}
            onChange={(e) => handleChange("faviconUrl", e.target.value)}
            placeholder="/favicon.ico"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="defaultLanguage" className="text-xs font-semibold text-slate-700">
            Default Language Code
          </label>
          <input
            id="defaultLanguage"
            type="text"
            value={formData.defaultLanguage}
            onChange={(e) => handleChange("defaultLanguage", e.target.value)}
            placeholder="en"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="timezone" className="text-xs font-semibold text-slate-700">
            Timezone
          </label>
          <input
            id="timezone"
            type="text"
            value={formData.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
            placeholder="Asia/Kolkata"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Maintenance Mode</span>
          <p className="text-[11px] text-slate-500">Display maintenance splash screen to storefront visitors</p>
        </div>
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={formData.maintenanceMode}
          onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
        />
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save General Settings"}</span>
        </button>
      </div>
    </form>
  );
}
