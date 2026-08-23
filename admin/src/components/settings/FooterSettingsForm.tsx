"use client";

import React, { useState } from "react";
import { FooterSettings } from "@/types/settings";
import { updateFooterSettings } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateFooterSettings(formData);
      setMessage({ type: "success", text: "Footer settings saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update footer settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Footer Configuration</CardTitle>
          <CardDescription>Customize footer blurb, link groups, newsletter visibility, and copyright notices.</CardDescription>
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
            <Label htmlFor="footerDescription">Footer About Blurb</Label>
            <Input
              id="footerDescription"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="AIRAVÉ represents contemporary minimalist tailoring..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input
              id="copyrightText"
              value={formData.copyrightText}
              onChange={(e) => setFormData((prev) => ({ ...prev, copyrightText: e.target.value }))}
              placeholder="© 2026 AIRAVÉ ATELIER. ALL RIGHTS RESERVED."
              required
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label className="font-semibold text-slate-900">Footer Component Visibility Toggles</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Show Contact Information</span>
                <input
                  type="checkbox"
                  checked={formData.showContactInfo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showContactInfo: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Show Social Media Links</span>
                <input
                  type="checkbox"
                  checked={formData.showSocialLinks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showSocialLinks: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Show Newsletter Signup Form</span>
                <input
                  type="checkbox"
                  checked={formData.showNewsletter}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showNewsletter: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Show Payment Method Badges</span>
                <input
                  type="checkbox"
                  checked={formData.showPaymentMethods}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showPaymentMethods: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save Footer Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
