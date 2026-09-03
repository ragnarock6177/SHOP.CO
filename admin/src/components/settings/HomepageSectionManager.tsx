"use client";

import React, { useState, useEffect } from "react";
import { HomepageSection } from "@/types/settings";
import {
  fetchHomepageSections,
  updateHomepageSection,
  bulkReorderHomepageSections,
  deleteHomepageSection,
  createHomepageSection,
} from "@/lib/settingsApi";
import { toast } from "@/lib/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Save, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";

export function HomepageSectionManager() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal Editing State
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Section State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState("");
  const [newSectionType, setNewSectionType] = useState("PRODUCT_GRID");

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await fetchHomepageSections();
      setSections(data);
    } catch (err) {
      toast.apiError(err, "Failed to load homepage sections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleToggleEnable = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await updateHomepageSection(id, { isEnabled: !currentStatus });
      setSections((prev) => prev.map((sec) => (sec.id === id ? updated : sec)));
      toast.success("Section updated", `Section '${updated.sectionKey}' visibility updated.`);
    } catch (err) {
      toast.apiError(err, "Failed to update section visibility.");
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update display orders
    const reordered = newSections.map((sec, idx) => ({
      ...sec,
      displayOrder: idx + 1,
    }));

    setSections(reordered);
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      const payload = sections.map((sec, idx) => ({
        id: sec.id,
        displayOrder: idx + 1,
        isEnabled: sec.isEnabled,
      }));
      await bulkReorderHomepageSections(payload);
      toast.success("Order saved", "Homepage section order saved successfully!");
    } catch (err) {
      toast.apiError(err, "Failed to save section ordering.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSection) return;
    try {
      setSaving(true);
      const updated = await updateHomepageSection(editingSection.id, {
        title: editingSection.title,
        subtitle: editingSection.subtitle,
        config: editingSection.config,
      });
      setSections((prev) => prev.map((sec) => (sec.id === editingSection.id ? updated : sec)));
      setIsDialogOpen(false);
      setEditingSection(null);
      toast.success("Section updated", "Section configuration updated!");
    } catch (err) {
      toast.apiError(err, "Failed to save section changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionKey.trim()) return;
    try {
      setSaving(true);
      const created = await createHomepageSection({
        sectionKey: newSectionKey.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        sectionType: newSectionType,
        displayOrder: sections.length + 1,
        isEnabled: true,
        config: {},
      });
      setSections((prev) => [...prev, created]);
      setIsAddOpen(false);
      setNewSectionKey("");
      toast.success("Section created", "New section added successfully!");
    } catch (err) {
      toast.apiError(err, "Failed to create section.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this homepage section?")) return;
    try {
      await deleteHomepageSection(id);
      setSections((prev) => prev.filter((sec) => sec.id !== id));
      toast.success("Section deleted", "Section removed!");
    } catch (err) {
      toast.apiError(err, "Failed to delete section.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400 shadow-2xs animate-pulse">
        Loading Homepage Section Manager...
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Homepage Section Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">Reorder dynamic homepage sections, toggle visibility, and configure product filter rules</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Section</span>
          </button>
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving..." : "Save Order"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((sec, index) => (
          <div
            key={sec.id}
            className={`flex items-center justify-between p-4 rounded-md border transition-all ${
              sec.isEnabled
                ? "bg-white border-slate-200/80 shadow-2xs"
                : "bg-slate-50 border-slate-200/60 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMove(index, "up")}
                  disabled={index === 0}
                  className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, "down")}
                  disabled={index === sections.length - 1}
                  className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              <div className="w-8 h-8 rounded-md bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {index + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{sec.title || sec.sectionKey}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                    {sec.sectionType}
                  </span>
                </div>
                {sec.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{sec.subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">{sec.isEnabled ? "ON" : "OFF"}</span>
                <input
                  type="checkbox"
                  checked={sec.isEnabled}
                  onChange={() => handleToggleEnable(sec.id, sec.isEnabled)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSection({ ...sec });
                  setIsDialogOpen(true);
                }}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                title="Edit Configuration"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(sec.id)}
                className="p-1.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Delete Section"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md rounded-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Configure Section: {editingSection.sectionKey}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Display Title</label>
                <input
                  type="text"
                  value={editingSection.title || ""}
                  onChange={(e) => setEditingSection((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  placeholder="Section Title"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Display Subtitle</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ""}
                  onChange={(e) => setEditingSection((prev) => (prev ? { ...prev, subtitle: e.target.value } : null))}
                  placeholder="Section Subtitle"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Product Selection Mode</label>
                <select
                  value={editingSection.config?.selectionMode || "LATEST"}
                  onChange={(e) =>
                    setEditingSection((prev) =>
                      prev
                        ? {
                            ...prev,
                            config: { ...prev.config, selectionMode: e.target.value as any },
                          }
                        : null
                    )
                  }
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                >
                  <option value="LATEST">LATEST (Newest Arrivals)</option>
                  <option value="BEST_SELLING">BEST_SELLING (Top Volume)</option>
                  <option value="FEATURED">FEATURED (Active Featured Items)</option>
                  <option value="TRENDING">TRENDING (Highest Rated)</option>
                  <option value="SALE">SALE (Discounted Products)</option>
                  <option value="MANUAL">MANUAL (Specific Product IDs)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Product Limit Count</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={editingSection.config?.limit || 6}
                  onChange={(e) =>
                    setEditingSection((prev) =>
                      prev
                        ? {
                            ...prev,
                            config: { ...prev.config, limit: parseInt(e.target.value) || 6 },
                          }
                        : null
                    )
                  }
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
              </div>
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
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Section Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add New Dynamic Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Section Machine Key</label>
              <input
                type="text"
                value={newSectionKey}
                onChange={(e) => setNewSectionKey(e.target.value)}
                placeholder="e.g. summer_promo_carousel"
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Section Component Type</label>
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              >
                <option value="HERO">HERO (Hero Banner Slider)</option>
                <option value="BRAND_BANNER">BRAND_BANNER (Brand Marquee)</option>
                <option value="CATEGORY_GRID">CATEGORY_GRID (Browse by Dress Style)</option>
                <option value="PRODUCT_GRID">PRODUCT_GRID (Generic Product Grid)</option>
                <option value="NEW_ARRIVALS">NEW_ARRIVALS (New Arrivals Lineup)</option>
                <option value="TOP_SELLING">TOP_SELLING (Top Selling Bestsellers)</option>
                <option value="EDITORIAL_SHOWCASE">EDITORIAL_SHOWCASE (Campaign Showcase)</option>
                <option value="CUSTOMER_REVIEWS">CUSTOMER_REVIEWS (Review Marquee)</option>
                <option value="NEWSLETTER">NEWSLETTER (VIP Newsletter Banner)</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSection}
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
            >
              Create Section
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
