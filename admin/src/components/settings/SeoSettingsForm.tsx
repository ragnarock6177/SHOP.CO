"use client";

import React, { useState } from "react";
import { SeoSettings } from "@/types/settings";
import { updateSeoSettings } from "@/lib/settingsApi";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

interface SeoSettingsFormProps {
  initialData?: SeoSettings;
  onSaved?: () => void;
}

export function SeoSettingsForm({ initialData, onSaved }: SeoSettingsFormProps) {
  const [formData, setFormData] = useState<SeoSettings>({
    siteTitle: initialData?.siteTitle || "AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel",
    siteDescription: initialData?.siteDescription || "Discover minimalist streetwear, oversized tailoring, and monochrome luxury silhouettes.",
    keywords: initialData?.keywords || ["streetwear", "luxury fashion", "monochrome", "airave", "menswear"],
    defaultOgImage: initialData?.defaultOgImage || "https://airave.com/og-image.jpg",
    faviconUrl: initialData?.faviconUrl || "/favicon.ico",
    robots: initialData?.robots || "index, follow",
  });

  const [keywordsText, setKeywordsText] = useState((formData.keywords || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const keywordsArray = keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload: SeoSettings = {
        ...formData,
        keywords: keywordsArray,
      };

      await updateSeoSettings(payload);
      setMessage({ type: "success", text: "SEO metadata settings saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update SEO settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">SEO & Metadata Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure global site titles, meta descriptions, OpenGraph share preview cards, and search crawler rules</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-md border ${
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

      <div className="space-y-1.5">
        <label htmlFor="siteTitle" className="text-xs font-semibold text-slate-700">
          Global Meta Site Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="siteTitle"
          type="text"
          value={formData.siteTitle}
          onChange={(e) => setFormData((prev) => ({ ...prev, siteTitle: e.target.value }))}
          placeholder="AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel"
          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="siteDescription" className="text-xs font-semibold text-slate-700">
          Global Meta Description <span className="text-rose-500">*</span>
        </label>
        <input
          id="siteDescription"
          type="text"
          value={formData.siteDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, siteDescription: e.target.value }))}
          placeholder="Discover minimalist streetwear, oversized tailoring, and monochrome luxury silhouettes."
          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="keywords" className="text-xs font-semibold text-slate-700">
          Meta Keywords (Comma-separated)
        </label>
        <input
          id="keywords"
          type="text"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder="streetwear, luxury fashion, monochrome, airave"
          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="defaultOgImage" className="text-xs font-semibold text-slate-700">
            Default OpenGraph Social Image URL
          </label>
          <input
            id="defaultOgImage"
            type="text"
            value={formData.defaultOgImage}
            onChange={(e) => setFormData((prev) => ({ ...prev, defaultOgImage: e.target.value }))}
            placeholder="https://airave.com/og-image.jpg"
            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="robots" className="text-xs font-semibold text-slate-700">
            Search Crawler Robots Rule
          </label>
          <input
            id="robots"
            type="text"
            value={formData.robots}
            onChange={(e) => setFormData((prev) => ({ ...prev, robots: e.target.value }))}
            placeholder="index, follow"
            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save SEO Settings"}</span>
        </button>
      </div>
    </form>
  );
}
