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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function HomepageSectionManager() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to load homepage sections." });
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
      setMessage({ type: "success", text: `Section '${updated.sectionKey}' visibility updated.` });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to update section visibility." });
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
      setMessage({ type: "success", text: "Homepage section order saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to save section ordering." });
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
      setMessage({ type: "success", text: "Section configuration updated!" });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to save section changes." });
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
      setMessage({ type: "success", text: "New section added successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to create section." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this homepage section?")) return;
    try {
      await deleteHomepageSection(id);
      setSections((prev) => prev.filter((sec) => sec.id !== id));
      setMessage({ type: "success", text: "Section removed!" });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to delete section." });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading Homepage Section Manager...</div>;
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Homepage Section Manager</CardTitle>
          <CardDescription>Drag or reorder dynamic homepage sections, toggle visibility, and edit display titles.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddOpen(true)} variant="outline" size="sm" className="border-slate-300">
            + Add Section
          </Button>
          <Button onClick={handleSaveOrder} disabled={saving} size="sm" className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save Section Order"}
          </Button>
        </div>
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

        <div className="space-y-3">
          {sections.map((sec, index) => (
            <div
              key={sec.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                sec.isEnabled ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="text-xs px-2 py-0.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sections.length - 1}
                    className="text-xs px-2 py-0.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-sm border border-slate-200">
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{sec.title || sec.sectionKey}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                      {sec.sectionType}
                    </Badge>
                  </div>
                  {sec.subtitle && <p className="text-xs text-slate-500 mt-0.5">{sec.subtitle}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">{sec.isEnabled ? "ON" : "OFF"}</span>
                  <input
                    type="checkbox"
                    checked={sec.isEnabled}
                    onChange={() => handleToggleEnable(sec.id, sec.isEnabled)}
                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingSection({ ...sec });
                    setIsDialogOpen(true);
                  }}
                  className="border-slate-200"
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(sec.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Section Modal */}
      {editingSection && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configure Section: {editingSection.sectionKey}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Display Title</Label>
                <Input
                  id="editTitle"
                  value={editingSection.title || ""}
                  onChange={(e) => setEditingSection((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  placeholder="Section Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editSubtitle">Display Subtitle</Label>
                <Input
                  id="editSubtitle"
                  value={editingSection.subtitle || ""}
                  onChange={(e) => setEditingSection((prev) => (prev ? { ...prev, subtitle: e.target.value } : null))}
                  placeholder="Section Subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selectionMode">Product Selection Mode</Label>
                <select
                  id="selectionMode"
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
                  className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
                >
                  <option value="LATEST">LATEST (Newest Arrivals)</option>
                  <option value="BEST_SELLING">BEST_SELLING (Top Volume)</option>
                  <option value="FEATURED">FEATURED (Active Featured Items)</option>
                  <option value="TRENDING">TRENDING (Highest Rated)</option>
                  <option value="SALE">SALE (Discounted Products)</option>
                  <option value="MANUAL">MANUAL (Specific Product IDs)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productLimit">Product Limit Count</Label>
                <Input
                  id="productLimit"
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving} className="bg-black text-white">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Section Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Dynamic Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newKey">Section Machine Key</Label>
              <Input
                id="newKey"
                value={newSectionKey}
                onChange={(e) => setNewSectionKey(e.target.value)}
                placeholder="e.g. summer_promo_carousel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newType">Section Component Type</Label>
              <select
                id="newType"
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection} disabled={saving} className="bg-black text-white">
              Create Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
