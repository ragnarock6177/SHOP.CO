"use client";

import React, { useState } from "react";
import { HeaderSettings } from "@/types/settings";
import { updateHeaderSettings } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Header & Navigation Settings</CardTitle>
          <CardDescription>Manage the announcement bar and global navigation visibility controls.</CardDescription>
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

          <div className="space-y-4 rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="announcementEnabled" className="font-semibold text-slate-900">
                  Announcement Bar
                </Label>
                <p className="text-xs text-slate-500">Show top notification banner across all storefront pages.</p>
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
                className="h-5 w-5 rounded border-slate-300 text-black focus:ring-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcementText">Announcement Text</Label>
              <Input
                id="announcementText"
                value={formData.announcementBar.text}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    announcementBar: { ...prev.announcementBar, text: e.target.value },
                  }))
                }
                placeholder="COMPLIMENTARY EXPRESS SHIPPING..."
                disabled={!formData.announcementBar.enabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcementLink">Action Link URL (Optional)</Label>
              <Input
                id="announcementLink"
                value={formData.announcementBar.link || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    announcementBar: { ...prev.announcementBar, link: e.target.value },
                  }))
                }
                placeholder="/collections/new-arrivals"
                disabled={!formData.announcementBar.enabled}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="font-semibold text-slate-900">Header Controls Visibility</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Search Icon</span>
                <input
                  type="checkbox"
                  checked={formData.searchVisible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, searchVisible: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Wishlist Icon</span>
                <input
                  type="checkbox"
                  checked={formData.wishlistVisible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, wishlistVisible: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Cart Drawer Icon</span>
                <input
                  type="checkbox"
                  checked={formData.cartVisible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cartVisible: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                <span className="text-sm font-medium">Account / Login Menu</span>
                <input
                  type="checkbox"
                  checked={formData.accountVisible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountVisible: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save Header Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
