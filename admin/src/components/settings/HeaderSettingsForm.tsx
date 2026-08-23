"use client";

import React, { useState } from "react";
import { HeaderSettings } from "@/types/settings";
import { updateHeaderSettings } from "@/lib/settingsApi";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

interface HeaderSettingsFormProps {
  initialData?: HeaderSettings;
  onSaved?: () => void;
}

export function HeaderSettingsForm({ initialData, onSaved }: HeaderSettingsFormProps) {
  const [formData, setFormData] = useState<HeaderSettings>({
    announcementBar: {
      enabled: initialData?.announcementBar?.enabled ?? true,
      text: initialData?.announcementBar?.text || "COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹5,000",
      link: initialData?.announcementBar?.link || "/collections/new-arrivals",
    },
    searchVisible: initialData?.searchVisible ?? true,
    wishlistVisible: initialData?.wishlistVisible ?? true,
    cartVisible: initialData?.cartVisible ?? true,
    accountVisible: initialData?.accountVisible ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateHeaderSettings(formData);
      setMessage({ type: "success", text: "Header settings saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update header settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">Header & Announcement Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Customize global top notification banner and header action visibility</p>
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

      {/* Announcement Bar Box */}
      <div className="space-y-4 rounded-xl border border-slate-200/80 p-4 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Top Announcement Bar</span>
            <p className="text-[11px] text-slate-500">Show notification banner at the top of all storefront pages</p>
          </div>
          <input
            type="checkbox"
            id="announcementEnabled"
            checked={formData.announcementBar.enabled}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                announcementBar: { ...prev.announcementBar, enabled: e.target.checked },
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="announcementText" className="text-xs font-semibold text-slate-700">
            Announcement Text
          </label>
          <input
            id="announcementText"
            type="text"
            value={formData.announcementBar.text}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                announcementBar: { ...prev.announcementBar, text: e.target.value },
              }))
            }
            placeholder="COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹5,000"
            disabled={!formData.announcementBar.enabled}
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs disabled:bg-slate-100 disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="announcementLink" className="text-xs font-semibold text-slate-700">
            CTA Action Link URL (Optional)
          </label>
          <input
            id="announcementLink"
            type="text"
            value={formData.announcementBar.link || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                announcementBar: { ...prev.announcementBar, link: e.target.value },
              }))
            }
            placeholder="/collections/new-arrivals"
            disabled={!formData.announcementBar.enabled}
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs disabled:bg-slate-100 disabled:opacity-60"
          />
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-slate-900 block">Header Elements Visibility</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Search Icon</span>
            <input
              type="checkbox"
              checked={formData.searchVisible}
              onChange={(e) => setFormData((prev) => ({ ...prev, searchVisible: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Wishlist Button</span>
            <input
              type="checkbox"
              checked={formData.wishlistVisible}
              onChange={(e) => setFormData((prev) => ({ ...prev, wishlistVisible: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Cart Drawer Button</span>
            <input
              type="checkbox"
              checked={formData.cartVisible}
              onChange={(e) => setFormData((prev) => ({ ...prev, cartVisible: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Account / User Menu</span>
            <input
              type="checkbox"
              checked={formData.accountVisible}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountVisible: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Header Settings"}</span>
        </button>
      </div>
    </form>
  );
}
