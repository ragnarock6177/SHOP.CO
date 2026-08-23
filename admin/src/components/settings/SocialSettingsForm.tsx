"use client";

import React, { useState } from "react";
import { SocialSettings, SocialPlatformConfig } from "@/types/settings";
import { updateSocialSettings } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  { key: "whatsapp", label: "WhatsApp Channel / Chat", placeholder: "https://wa.me/919876543210" },
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Social Media Channels</CardTitle>
          <CardDescription>Configure external social profile links and visibility toggles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-3 text-xs font-semibold rounded-md ${
                message.type === "success"
                  ? "bg-slate-100 text-slate-900 border border-slate-300"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            {PLATFORMS.map((platform) => {
              const config = formData[platform.key];
              return (
                <div key={platform.key} className="flex items-center gap-4 p-3 border border-slate-200 rounded-md">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handlePlatformChange(platform.key, "enabled", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                  />
                  <div className="w-36">
                    <Label className="text-sm font-semibold">{platform.label}</Label>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={config.url}
                      onChange={(e) => handlePlatformChange(platform.key, "url", e.target.value)}
                      placeholder={platform.placeholder}
                      disabled={!config.enabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save Social Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
