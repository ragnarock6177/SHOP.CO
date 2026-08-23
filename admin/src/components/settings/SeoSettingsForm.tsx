"use client";

import React, { useState } from "react";
import { SeoSettings } from "@/types/settings";
import { updateSeoSettings } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">SEO & Metadata Configuration</CardTitle>
          <CardDescription>Configure global site titles, meta descriptions, OpenGraph share images, and search crawler rules.</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="siteTitle">Global Meta Site Title</Label>
            <Input
              id="siteTitle"
              value={formData.siteTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, siteTitle: e.target.value }))}
              placeholder="AIRAVÉ — High-Fashion Streetwear..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Global Meta Description</Label>
            <Input
              id="siteDescription"
              value={formData.siteDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, siteDescription: e.target.value }))}
              placeholder="Discover minimalist streetwear..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Meta Keywords (Comma-separated)</Label>
            <Input
              id="keywords"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="streetwear, luxury fashion, monochrome, airave"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultOgImage">Default OpenGraph Image URL</Label>
              <Input
                id="defaultOgImage"
                value={formData.defaultOgImage}
                onChange={(e) => setFormData((prev) => ({ ...prev, defaultOgImage: e.target.value }))}
                placeholder="https://airave.com/og-image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robots">Robots Crawler Rules</Label>
              <Input
                id="robots"
                value={formData.robots}
                onChange={(e) => setFormData((prev) => ({ ...prev, robots: e.target.value }))}
                placeholder="index, follow"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save SEO Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
