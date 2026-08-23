"use client";

import React, { useState } from "react";
import { GeneralSettings } from "@/types/settings";
import { updateGeneralSettings } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setMessage({ type: "success", text: "General settings saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update general settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">General Store Configuration</CardTitle>
          <CardDescription>Configure core branding, currency, locale, and maintenance status.</CardDescription>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. AIRAVÉ"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency Code</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value.toUpperCase())}
                placeholder="e.g. INR"
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Store Tagline / Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="e.g. Luxury High-Fashion Streetwear & Contemporary Apparel"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo Image URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                placeholder="/images/logo.svg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={formData.faviconUrl}
                onChange={(e) => handleChange("faviconUrl", e.target.value)}
                placeholder="/favicon.ico"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Input
                id="defaultLanguage"
                value={formData.defaultLanguage}
                onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                placeholder="en"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                placeholder="Asia/Kolkata"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <Label htmlFor="maintenanceMode" className="font-semibold text-slate-900">
                Maintenance Mode
              </Label>
              <p className="text-xs text-slate-500">Temporarily display splash page to customers.</p>
            </div>
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={formData.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-black focus:ring-black"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save General Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
