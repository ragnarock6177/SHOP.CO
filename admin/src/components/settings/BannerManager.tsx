"use client";

import React, { useState, useEffect } from "react";
import { Banner, BannerTargetType } from "@/types/settings";
import { fetchBanners, createBanner, updateBanner, deleteBanner } from "@/lib/settingsApi";
import apiClient from "@/lib/apiClient";
import { compressBannerImage } from "@/utils/imageCompressor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Plus, Edit, Trash2, Tag, Upload, ImageIcon, Loader2 } from "lucide-react";

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; basePrice: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Compression & Upload State
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [desktopCompressionStats, setDesktopCompressionStats] = useState<string | null>(null);
  const [mobileCompressionStats, setMobileCompressionStats] = useState<string | null>(null);

  // Brand Marquee State
  const [marqueeItems, setMarqueeItems] = useState<Array<{ name: string; isBrand: boolean }>>([
    { name: "VERSACE", isBrand: true },
    { name: "PREMIUM HEAVYWEIGHT COTTON", isBrand: false },
    { name: "GUCCI", isBrand: true },
    { name: "FREE WORLDWIDE EXPRESS SHIPPING", isBrand: false },
    { name: "PRADA", isBrand: true },
    { name: "ETHICALLY CRAFTED ATELIER", isBrand: false },
    { name: "NIKE", isBrand: true },
    { name: "30-DAY COMPLIMENTARY RETURNS", isBrand: false },
    { name: "ZARA", isBrand: true },
    { name: "CALVIN KLEIN", isBrand: true },
  ]);
  const [savingMarquee, setSavingMarquee] = useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  const loadBannersAndProducts = async () => {
    try {
      setLoading(true);
      const [bannersData, productsRes, settingsRes] = await Promise.all([
        fetchBanners().catch(() => []),
        apiClient.get("/admin/products?limit=100").catch(() => ({ data: { data: { products: [] } } })),
        apiClient.get("/admin/settings").catch(() => ({ data: { data: {} } })),
      ]);

      setBanners(bannersData);

      const prodsList = productsRes.data?.data?.products || productsRes.data?.data || [];
      if (Array.isArray(prodsList)) {
        setProducts(prodsList.map((p: any) => ({ id: p.id, name: p.name, basePrice: Number(p.basePrice || 0) })));
      }

      const brandMarquee = settingsRes.data?.data?.brand_marquee;
      if (brandMarquee && Array.isArray(brandMarquee) && brandMarquee.length > 0) {
        setMarqueeItems(brandMarquee);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to load promotional banners or settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBannersAndProducts();
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
      setDesktopCompressionStats(null);
      setMobileCompressionStats(null);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to save banner." });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, isDesktop: boolean) => {
    const setUploading = isDesktop ? setUploadingDesktop : setUploadingMobile;
    const setStats = isDesktop ? setDesktopCompressionStats : setMobileCompressionStats;

    try {
      setUploading(true);
      // 1. Quality-preserving WebP Compression (0.85 ratio, 1920x1080 max)
      const compressed = await compressBannerImage(file);
      setStats(
        `Compressed: ${compressed.originalSizeKb} KB → ${compressed.compressedSizeKb} KB (-${compressed.reductionPercentage}%)`
      );

      // 2. Upload compressed payload to backend API
      const res = await apiClient.post("/admin/upload/banner", {
        image: compressed.dataUrl,
        fileName: compressed.file.name,
      });

      const publicUrl = res.data?.data?.publicUrl;
      if (publicUrl) {
        setEditingBanner((prev) =>
          isDesktop ? { ...prev, desktopImageUrl: publicUrl } : { ...prev, mobileImageUrl: publicUrl }
        );
      }
    } catch (err: any) {
      alert("Failed to compress and upload banner image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMarquee = async () => {
    try {
      setSavingMarquee(true);
      await apiClient.put("/admin/settings/marquee", marqueeItems);
      setMessage({ type: "success", text: "Brand Marquee items saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to save brand marquee settings." });
    } finally {
      setSavingMarquee(false);
    }
  };

  const handleAddMarqueeItem = () => {
    setMarqueeItems((prev) => [...prev, { name: "NEW BRAND / BADGE", isBrand: true }]);
  };

  const handleRemoveMarqueeItem = (index: number) => {
    setMarqueeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMarqueeItem = (index: number, field: "name" | "isBrand", val: any) => {
    setMarqueeItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  if (loading) {
    return (
      <div className="rounded-md border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400 shadow-2xs animate-pulse">
        Loading Promotional & Hero Banners...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION 1: Hero Carousel & Campaign Banners */}
      <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Promotional & Hero Banners</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage campaign poster slides, upload compressed banner images, choose optional linked products for the &apos;+&apos; hotspot pin popover, and set click targets
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingBanner({
                targetType: "NONE",
                isEnabled: true,
                displayOrder: banners.length + 1,
              });
              setDesktopCompressionStats(null);
              setMobileCompressionStats(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Banner</span>
          </button>
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

        {banners.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200/80 rounded-md text-slate-500 text-xs">
            No promotional banners configured yet. Click &quot;Add New Banner&quot; above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`border rounded-md overflow-hidden flex flex-col justify-between transition-all ${
                  banner.isEnabled ? "border-slate-200/80 bg-white shadow-2xs" : "border-slate-200/60 bg-slate-50 opacity-60"
                }`}
              >
                <div className="relative h-44 bg-slate-100 border-b border-slate-200/80">
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {banner.targetProductId ? (
                      <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        + Hotspot Active
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-700/80 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        No Hotspot Pin
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{banner.title || "Untitled Banner"}</h4>
                  {banner.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{banner.subtitle}</p>}

                  {banner.targetProductId && (
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 inline-block">
                        Linked Product: ID &quot;{banner.targetProductId}&quot;
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
                        setDesktopCompressionStats(null);
                        setMobileCompressionStats(null);
                        setIsDialogOpen(true);
                      }}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
      </div>

      {/* SECTION 2: Brand Marquee Settings */}
      <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-700" />
              <span>Brand Marquee Customization</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the scrolling brand logos & USP badge items displayed directly below the Hero Banner
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddMarqueeItem}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md border border-slate-200 hover:bg-slate-100 text-slate-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Marquee Item
            </button>
            <button
              type="button"
              onClick={handleSaveMarquee}
              disabled={savingMarquee}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer"
            >
              {savingMarquee ? "Saving..." : "Save Marquee"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {marqueeItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-md border border-slate-200/80 bg-slate-50/50 hover:bg-white transition"
            >
              <span className="text-xs font-bold text-slate-400 w-6 text-center">
                #{idx + 1}
              </span>

              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateMarqueeItem(idx, "name", e.target.value)}
                className="flex-1 h-8 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold tracking-wider uppercase focus:border-slate-900 outline-none"
                placeholder="BRAND NAME OR USP BADGE TEXT"
              />

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none px-2">
                <input
                  type="checkbox"
                  checked={item.isBrand}
                  onChange={(e) => handleUpdateMarqueeItem(idx, "isBrand", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Brand Style (Bold White)</span>
              </label>

              <button
                type="button"
                onClick={() => handleRemoveMarqueeItem(idx)}
                className="p-1 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Create Banner Dialog */}
      {editingBanner && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg rounded-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingBanner.id ? "Edit Campaign Banner" : "Create New Campaign Banner"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto px-1 sidebar-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Headline Title</label>
                <input
                  type="text"
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. SPRING SUMMER CAMPAIGN"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Subheadline / Description</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ""}
                  onChange={(e) => setEditingBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Engineered for movement and high-contrast aesthetics"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              {/* OPTIONAL FEATURED PRODUCT HOTSPOT SELECTOR */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-md">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Featured Product Hotspot (&apos;+&apos; Pin Popover)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Select a product to display the interactive &apos;+&apos; hotspot pin on this banner slide. If not selected, the &apos;+&apos; pin will NOT be shown on storefront.
                </p>
                <select
                  value={editingBanner.targetProductId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value || null;
                    setEditingBanner((prev) => ({
                      ...prev,
                      targetProductId: selectedId,
                      targetType: selectedId ? "PRODUCT" : prev?.targetType === "PRODUCT" ? "NONE" : (prev?.targetType || "NONE"),
                    }));
                  }}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                >
                  <option value="">None (Do Not Show &apos;+&apos; Hotspot Pin on Slide)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* DESKTOP BANNER IMAGE WITH QUALITY-PRESERVING UPLOADER */}
              <div className="space-y-2 p-3 bg-slate-50/80 border border-slate-200/80 rounded-md">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Desktop Banner Image <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-500 font-normal">WebP Compressed (Quality Preserved)</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingBanner.desktopImageUrl || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, desktopImageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                    required
                  />

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition cursor-pointer shrink-0">
                    {uploadingDesktop ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compressing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, true);
                      }}
                    />
                  </label>
                </div>

                {desktopCompressionStats && (
                  <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    ✓ {desktopCompressionStats}
                  </p>
                )}

                {editingBanner.desktopImageUrl && (
                  <div className="relative h-28 rounded-md overflow-hidden border border-slate-200 bg-slate-100 mt-1">
                    <img
                      src={editingBanner.desktopImageUrl}
                      alt="Desktop Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* MOBILE BANNER IMAGE WITH QUALITY-PRESERVING UPLOADER */}
              <div className="space-y-2 p-3 bg-slate-50/80 border border-slate-200/80 rounded-md">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Mobile Banner Image (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-normal">WebP Compressed</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingBanner.mobileImageUrl || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, mobileImageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition cursor-pointer shrink-0">
                    {uploadingMobile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compressing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, false);
                      }}
                    />
                  </label>
                </div>

                {mobileCompressionStats && (
                  <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    ✓ {mobileCompressionStats}
                  </p>
                )}

                {editingBanner.mobileImageUrl && (
                  <div className="relative h-28 rounded-md overflow-hidden border border-slate-200 bg-slate-100 mt-1">
                    <img
                      src={editingBanner.mobileImageUrl}
                      alt="Mobile Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.buttonText || ""}
                    onChange={(e) => setEditingBanner((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="EXPLORE CAPSULE"
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Navigation Target</label>
                  <select
                    value={editingBanner.targetType || "NONE"}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({ ...prev, targetType: e.target.value as BannerTargetType }))
                    }
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
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
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={saving || uploadingDesktop || uploadingMobile}
                className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
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
