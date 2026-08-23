"use client";

import React, { useState } from "react";
import { SocialSettings, SocialPlatformConfig } from "@/types/settings";
import { updateSocialSettings } from "@/lib/settingsApi";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

interface SocialSettingsFormProps {
  initialData?: SocialSettings;
  onSaved?: () => void;
}

const PLATFORMS: Array<{ key: keyof SocialSettings; label: string; placeholder: string }> = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/airave" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/airave" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@airave" },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/airave" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/airave" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/airave" },
  { key: "whatsapp", label: "WhatsApp Channel", placeholder: "https://wa.me/919876543210" },
];

export function SocialSettingsForm({ initialData, onSaved }: SocialSettingsFormProps) {
  const [formData, setFormData] = useState<SocialSettings>({
    instagram: initialData?.instagram || { enabled: true, url: "https://instagram.com/airave" },
    facebook: initialData?.facebook || { enabled: true, url: "https://facebook.com/airave" },
    youtube: initialData?.youtube || { enabled: true, url: "https://youtube.com/@airave" },
    twitter: initialData?.twitter || { enabled: true, url: "https://x.com/airave" },
    linkedin: initialData?.linkedin || { enabled: false, url: "" },
    pinterest: initialData?.pinterest || { enabled: true, url: "https://pinterest.com/airave" },
    whatsapp: initialData?.whatsapp || { enabled: true, url: "https://wa.me/919876543210" },
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePlatformChange = (key: keyof SocialSettings, field: keyof SocialPlatformConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateSocialSettings(formData);
      setMessage({ type: "success", text: "Social media links saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update social settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">Social Media Channels</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure external brand profile links and visibility toggles</p>
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

      <div className="space-y-3">
        {PLATFORMS.map((platform) => {
          const config = formData[platform.key];
          return (
            <div key={platform.key} className="flex items-center gap-4 p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handlePlatformChange(platform.key, "enabled", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <div className="w-32 sm:w-36">
                <span className="text-xs font-bold text-slate-900">{platform.label}</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={config.url}
                  onChange={(e) => handlePlatformChange(platform.key, "url", e.target.value)}
                  placeholder={platform.placeholder}
                  disabled={!config.enabled}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs disabled:bg-slate-100 disabled:opacity-60"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Social Settings"}</span>
        </button>
      </div>
    </form>
  );
}
