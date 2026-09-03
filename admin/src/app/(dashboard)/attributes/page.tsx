"use client";

import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Palette,
  ChevronDown,
  ChevronUp,
  Tag,
  Layers,
} from "lucide-react";
import {
  useAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
  useAddAttributeValue,
  useDeleteAttributeValue,
  AttributeItem,
  AttributeValueItem,
} from "@/hooks/queries/useAttributes";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { toast } from "@/lib/toast";

export default function AttributesPage() {
  const { data: attributes = [], isLoading } = useAttributes();
  const createAttributeMutation = useCreateAttribute();
  const updateAttributeMutation = useUpdateAttribute();
  const deleteAttributeMutation = useDeleteAttribute();
  const addValueMutation = useAddAttributeValue();
  const deleteValueMutation = useDeleteAttributeValue();

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeItem | null>(null);
  const [deletingAttributeId, setDeletingAttributeId] = useState<string | null>(null);
  const [deletingValueId, setDeletingValueId] = useState<string | null>(null);

  // Form States for Attribute
  const [attrName, setAttrName] = useState("");
  const [attrSlug, setAttrSlug] = useState("");
  const [attrDesc, setAttrDesc] = useState("");
  const [isVariant, setIsVariant] = useState(true);
  const [isFilterable, setIsFilterable] = useState(true);

  // Form States for Adding Value
  const [activeAttrForValue, setActiveAttrForValue] = useState<string | null>(null);
  const [newValueVal, setNewValueVal] = useState("");
  const [newValueSlug, setNewValueSlug] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [includeHex, setIncludeHex] = useState(false);

  // Open Create Modal
  const handleOpenCreate = () => {
    setAttrName("");
    setAttrSlug("");
    setAttrDesc("");
    setIsVariant(true);
    setIsFilterable(true);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (attr: AttributeItem) => {
    setEditingAttribute(attr);
    setAttrName(attr.name);
    setAttrSlug(attr.slug);
    setAttrDesc(attr.description || "");
    setIsVariant(attr.isVariantAttribute);
    setIsFilterable(attr.isFilterable);
  };

  // Submit Create
  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim()) return;

    createAttributeMutation.mutate(
      {
        name: attrName.trim(),
        slug: attrSlug.trim() || attrName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: attrDesc.trim() || undefined,
        isVariantAttribute: isVariant,
        isFilterable: isFilterable,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          toast.success("Attribute Created", `Attribute "${attrName}" added successfully.`);
        },
        onError: (err: any) => {
          toast.error("Error", err.response?.data?.message || "Failed to create attribute.");
        },
      }
    );
  };

  // Submit Edit
  const handleUpdateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttribute || !attrName.trim()) return;

    updateAttributeMutation.mutate(
      {
        id: editingAttribute.id,
        name: attrName.trim(),
        slug: attrSlug.trim(),
        description: attrDesc.trim() || undefined,
        isVariantAttribute: isVariant,
        isFilterable: isFilterable,
      },
      {
        onSuccess: () => {
          setEditingAttribute(null);
          toast.success("Attribute Updated", "Attribute updated successfully.");
        },
        onError: (err: any) => {
          toast.error("Error", err.response?.data?.message || "Failed to update attribute.");
        },
      }
    );
  };

  // Submit Delete Attribute
  const handleConfirmDeleteAttribute = () => {
    if (!deletingAttributeId) return;
    deleteAttributeMutation.mutate(deletingAttributeId, {
      onSuccess: () => {
        setDeletingAttributeId(null);
        toast.success("Attribute Deleted", "Attribute removed successfully.");
      },
      onError: (err: any) => {
        toast.error("Error", err.response?.data?.message || "Failed to delete attribute.");
      },
    });
  };

  // Submit Add Value
  const handleAddValue = (attributeId: string) => {
    if (!newValueVal.trim()) return;

    addValueMutation.mutate(
      {
        attributeId,
        value: newValueVal.trim(),
        slug: newValueSlug.trim() || newValueVal.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        colorHex: includeHex ? newColorHex : null,
      },
      {
        onSuccess: () => {
          setNewValueVal("");
          setNewValueSlug("");
          setActiveAttrForValue(null);
          toast.success("Value Added", "New attribute value registered.");
        },
        onError: (err: any) => {
          toast.error("Error", err.response?.data?.message || "Failed to add attribute value.");
        },
      }
    );
  };

  // Submit Delete Value
  const handleConfirmDeleteValue = () => {
    if (!deletingValueId) return;
    deleteValueMutation.mutate(deletingValueId, {
      onSuccess: () => {
        setDeletingValueId(null);
        toast.success("Value Removed", "Attribute value removed.");
      },
      onError: (err: any) => {
        toast.error("Error", err.response?.data?.message || "Failed to delete value.");
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Product Attributes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure variant options (Color, Size) and specification attributes for your catalog
          </p>
        </div>

        <PermissionGate permission="attributes:create">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Attribute</span>
          </button>
        </PermissionGate>
      </div>

      {/* Attribute Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-slate-200 bg-white p-5 animate-pulse" />
          ))}
        </div>
      ) : attributes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Sliders className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Attributes Configured</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Attributes like Color and Size let you create dynamic variations for your products.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Attribute</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {attributes.map((attr) => {
            const isColorType =
              attr.slug === "color" ||
              attr.name.toLowerCase() === "color" ||
              attr.values.some((v) => Boolean(v.colorHex));
            const isAddingValue = activeAttrForValue === attr.id;

            return (
              <div
                key={attr.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        {isColorType ? <Palette className="h-4 w-4" /> : <Sliders className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{attr.name}</h3>
                          <span className="text-[10px] text-slate-400 font-medium">({attr.slug})</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {attr.isVariantAttribute && (
                            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              Variant Option
                            </span>
                          )}
                          {attr.isFilterable && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider border border-slate-200/80">
                              Filterable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(attr)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                        title="Edit Attribute"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAttributeId(attr.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Attribute"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Attribute Values List */}
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Available Values ({attr.values.length})
                      </span>
                      {!isAddingValue && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAttrForValue(attr.id);
                            setNewValueVal("");
                            setNewValueSlug("");
                            setIncludeHex(isColorType);
                            setNewColorHex("#000000");
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:text-slate-600 transition cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Value</span>
                        </button>
                      )}
                    </div>

                    {attr.values.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No values defined yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {attr.values.map((val) => (
                          <div
                            key={val.id}
                            className="group flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-800 transition-colors hover:bg-white hover:border-slate-300 shadow-2xs"
                          >
                            {val.colorHex && (
                              <span
                                className="h-3 w-3 rounded-full border border-black/20 shadow-2xs shrink-0"
                                style={{ backgroundColor: val.colorHex }}
                                title={val.colorHex}
                              />
                            )}
                            <span>{val.value}</span>
                            <button
                              type="button"
                              onClick={() => setDeletingValueId(val.id)}
                              className="text-slate-400 hover:text-rose-600 transition opacity-60 group-hover:opacity-100 cursor-pointer"
                              title="Delete value"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Add Value Form */}
                {isAddingValue && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Add New Value to {attr.name}</span>
                      <button
                        type="button"
                        onClick={() => setActiveAttrForValue(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Value Name</label>
                        <input
                          type="text"
                          value={newValueVal}
                          onChange={(e) => {
                            setNewValueVal(e.target.value);
                            setNewValueSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                          }}
                          placeholder="e.g. Midnight Navy"
                          className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Slug</label>
                        <input
                          type="text"
                          value={newValueSlug}
                          onChange={(e) => setNewValueSlug(e.target.value)}
                          placeholder="midnight-navy"
                          className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Color Swatch Picker */}
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeHex}
                          onChange={(e) => setIncludeHex(e.target.checked)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <span>Attach Color Swatch</span>
                      </label>

                      {includeHex && (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="h-6 w-7 cursor-pointer rounded border border-slate-300 p-0"
                          />
                          <input
                            type="text"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-20 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveAttrForValue(null)}
                        className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddValue(attr.id)}
                        disabled={addValueMutation.isPending || !newValueVal.trim()}
                        className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        {addValueMutation.isPending ? "Adding..." : "Save Value"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Attribute Modal ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Create New Attribute</h3>
            <form onSubmit={handleCreateAttribute} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attribute Name</label>
                <input
                  type="text"
                  value={attrName}
                  onChange={(e) => {
                    setAttrName(e.target.value);
                    setAttrSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  placeholder="e.g. Material, Pattern, Fit"
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={attrSlug}
                  onChange={(e) => setAttrSlug(e.target.value)}
                  placeholder="material"
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={attrDesc}
                  onChange={(e) => setAttrDesc(e.target.value)}
                  placeholder="Brief description of this specification"
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isVariant}
                    onChange={(e) => setIsVariant(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Use for Variant Generation (e.g. Color, Size)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isFilterable}
                    onChange={(e) => setIsFilterable(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Enable Storefront Filter</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAttributeMutation.isPending || !attrName}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {createAttributeMutation.isPending ? "Creating..." : "Save Attribute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Attribute Modal ── */}
      {editingAttribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Edit Attribute</h3>
            <form onSubmit={handleUpdateAttribute} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attribute Name</label>
                <input
                  type="text"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={attrSlug}
                  onChange={(e) => setAttrSlug(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={attrDesc}
                  onChange={(e) => setAttrDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isVariant}
                    onChange={(e) => setIsVariant(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Use for Variant Generation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isFilterable}
                    onChange={(e) => setIsFilterable(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Enable Storefront Filter</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAttribute(null)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateAttributeMutation.isPending || !attrName}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {updateAttributeMutation.isPending ? "Saving..." : "Update Attribute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Attribute Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(deletingAttributeId)}
        onCancel={() => setDeletingAttributeId(null)}
        onConfirm={handleConfirmDeleteAttribute}
        title="Delete Attribute"
        description="Are you sure you want to delete this attribute? All associated attribute values will also be deleted."
        confirmLabel="Delete Attribute"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteAttributeMutation.isPending}
      />

      {/* ── Confirm Delete Value Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(deletingValueId)}
        onCancel={() => setDeletingValueId(null)}
        onConfirm={handleConfirmDeleteValue}
        title="Delete Attribute Value"
        description="Are you sure you want to remove this value?"
        confirmLabel="Delete Value"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteValueMutation.isPending}
      />
    </div>
  );
}
