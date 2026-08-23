"use client";

import React, { useState, useEffect } from "react";
import { Banner, BannerTargetType } from "@/types/settings";
import { fetchBanners, createBanner, updateBanner, deleteBanner } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await fetchBanners();
      setBanners(data);
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to load promotional banners." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleToggleEnable = async (banner: Banner) => {
    try {
      const updated = await updateBanner(banner.id, { isEnabled: !banner.isEnabled });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      setMessage({ type: "success", text: `Banner status updated.` });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to update banner status." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return;
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setMessage({ type: "success", text: "Banner deleted." });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to delete banner." });
    }
  };

  const handleSaveBanner = async () => {
    if (!editingBanner || !editingBanner.desktopImageUrl) {
      alert("Desktop Image URL is required.");
      return;
    }

    try {
      setSaving(true);
      if (editingBanner.id) {
        const updated = await updateBanner(editingBanner.id, editingBanner);
        setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? updated : b)));
        setMessage({ type: "success", text: "Banner updated successfully!" });
      } else {
        const created = await createBanner(editingBanner);
        setBanners((prev) => [...prev, created]);
        setMessage({ type: "success", text: "New banner created successfully!" });
      }
      setIsDialogOpen(false);
      setEditingBanner(null);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to save banner." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading Hero & Campaign Banners...</div>;
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Promotional & Hero Banners</CardTitle>
          <CardDescription>Manage hero carousel slides, campaign poster graphics, scheduling, and click destinations.</CardDescription>
        </div>
        <Button
          onClick={() => {
            setEditingBanner({
              targetType: "NONE",
              isEnabled: true,
              displayOrder: banners.length + 1,
            });
            setIsDialogOpen(true);
          }}
          className="bg-black text-white hover:bg-slate-800"
          size="sm"
        >
          + Add New Banner
        </Button>
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

        {banners.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
            No promotional banners configured yet. Click &quot;Add New Banner&quot; above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`border rounded-lg overflow-hidden flex flex-col justify-between transition-all ${
                  banner.isEnabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-60"
                }`}
              >
                <div className="relative h-44 bg-slate-100 border-b border-slate-200">
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-xs text-[10px]">
                      Target: {banner.targetType}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">{banner.title || "Untitled Banner"}</h4>
                  {banner.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{banner.subtitle}</p>}
                  
                  {banner.buttonText && (
                    <div className="pt-1">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200 inline-block">
                        Button: &quot;{banner.buttonText}&quot;
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={banner.isEnabled}
                      onChange={() => handleToggleEnable(banner)}
                      className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                    />
                    <span className="text-xs font-semibold text-slate-600">{banner.isEnabled ? "Active" : "Disabled"}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingBanner({ ...banner });
                        setIsDialogOpen(true);
                      }}
                      className="border-slate-200"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(banner.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit / Create Banner Dialog */}
      {editingBanner && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner.id ? "Edit Banner" : "Create New Banner"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label htmlFor="bannerTitle">Headline Title</Label>
                <Input
                  id="bannerTitle"
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. URBAN TECHWEAR CAPSULE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerSubtitle">Subheadline / Description</Label>
                <Input
                  id="bannerSubtitle"
                  value={editingBanner.subtitle || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Engineered for movement and high-contrast aesthetics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktopImageUrl">Desktop Image URL</Label>
                <Input
                  id="desktopImageUrl"
                  value={editingBanner.desktopImageUrl || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, desktopImageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileImageUrl">Mobile Image URL (Optional)</Label>
                <Input
                  id="mobileImageUrl"
                  value={editingBanner.mobileImageUrl || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, mobileImageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">CTA Button Text</Label>
                  <Input
                    id="buttonText"
                    value={editingBanner.buttonText || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="e.g. EXPLORE CAPSULE"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetType">Navigation Target Type</Label>
                  <select
                    id="targetType"
                    value={editingBanner.targetType || "NONE"}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({ ...prev, targetType: e.target.value as BannerTargetType }))
                    }
                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
                  >
                    <option value="NONE">NONE (No Link)</option>
                    <option value="PRODUCT">PRODUCT (Link to Product)</option>
                    <option value="CATEGORY">CATEGORY (Link to Category)</option>
                    <option value="URL">URL (External Link)</option>
                  </select>
                </div>
              </div>

              {editingBanner.targetType === "URL" && (
                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">Custom Target URL</Label>
                  <Input
                    id="buttonUrl"
                    value={editingBanner.buttonUrl || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, buttonUrl: e.target.value }))}
                    placeholder="https://airave.com/collections/sale"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBanner} disabled={saving} className="bg-black text-white">
                {saving ? "Saving..." : "Save Banner"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
