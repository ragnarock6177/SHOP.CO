"use client";

import React, { useState, useEffect } from "react";
import { Banner, BannerTargetType } from "@/types/settings";
import { fetchBanners, createBanner, updateBanner, deleteBanner } from "@/lib/settingsApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";

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
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400 shadow-2xs animate-pulse">
        Loading Promotional & Hero Banners...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Promotional & Hero Banners</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage hero carousel slides, campaign poster graphics, and click destinations</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingBanner({
              targetType: "NONE",
              isEnabled: true,
              displayOrder: banners.length + 1,
            });
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Banner</span>
        </button>
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

      {banners.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200/80 rounded-xl text-slate-500 text-xs">
          No promotional banners configured yet. Click &quot;Add New Banner&quot; above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`border rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                banner.isEnabled ? "border-slate-200/80 bg-white shadow-2xs" : "border-slate-200/60 bg-slate-50 opacity-60"
              }`}
            >
              <div className="relative h-44 bg-slate-100 border-b border-slate-200/80">
                <img
                  src={banner.desktopImageUrl}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="rounded-full bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                    {banner.targetType}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{banner.title || "Untitled Banner"}</h4>
                {banner.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{banner.subtitle}</p>}
                
                {banner.buttonText && (
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 inline-block font-mono">
                      Button: &quot;{banner.buttonText}&quot;
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={banner.isEnabled}
                    onChange={() => handleToggleEnable(banner)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-600">{banner.isEnabled ? "Active" : "Disabled"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner({ ...banner });
                      setIsDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Banner Dialog */}
      {editingBanner && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{editingBanner.id ? "Edit Banner" : "Create New Banner"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto px-1 sidebar-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Headline Title</label>
                <input
                  type="text"
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. URBAN TECHWEAR CAPSULE"
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Subheadline / Description</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Engineered for movement and high-contrast aesthetics"
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Desktop Image URL <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={editingBanner.desktopImageUrl || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, desktopImageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Mobile Image URL (Optional)</label>
                <input
                  type="text"
                  value={editingBanner.mobileImageUrl || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, mobileImageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.buttonText || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="EXPLORE CAPSULE"
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Navigation Target</label>
                  <select
                    value={editingBanner.targetType || "NONE"}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({ ...prev, targetType: e.target.value as BannerTargetType }))
                    }
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  >
                    <option value="NONE">NONE (No Link)</option>
                    <option value="PRODUCT">PRODUCT (Link to Product)</option>
                    <option value="CATEGORY">CATEGORY (Link to Category)</option>
                    <option value="URL">URL (External Link)</option>
                  </select>
                </div>
              </div>

              {editingBanner.targetType === "URL" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Custom Target URL</label>
                  <input
                    type="text"
                    value={editingBanner.buttonUrl || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, buttonUrl: e.target.value }))}
                    placeholder="https://airave.com/collections/sale"
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
              >
                {saving ? "Saving..." : "Save Banner"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
