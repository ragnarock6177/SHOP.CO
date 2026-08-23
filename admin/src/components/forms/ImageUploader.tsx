"use client";

import React, { useCallback, useRef, useState, useMemo } from "react";
import {
  Upload,
  Star,
  Trash2,
  GripVertical,
  Check,
  Loader2,
  ImagePlus,
  AlertCircle,
  X,
  Maximize2,
  Copy,
  SlidersHorizontal,
  Tags,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import {
  useProductImages,
  usePresignUpload,
  useAddProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
  useReorderProductImages,
  ProductImage,
} from "@/hooks/queries/useProductImages";

// ── Client-side image compression ────────────────────────────────────────────
// Converts any image to WebP at 0.85 quality and caps dimensions at 2048px.
async function compressImage(file: File, maxPx = 2048, quality = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;
  if (width > maxPx || height > maxPx) {
    const ratio = Math.min(maxPx / width, maxPx / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas compression failed"));
        const baseName = file.name.replace(/\.[^.]+$/, "");
        resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
      },
      "image/webp",
      quality
    );
  });
}

export interface VariantItem {
  id: string;
  sku?: string;
  variantName?: string | null;
  price?: number;
  attributes?: Array<{
    attributeSlug?: string;
    attributeName: string;
    value: string;
    colorHex?: string | null;
  }>;
  variantAttributeValues?: Array<{
    attributeValue?: {
      value: string;
      colorHex?: string | null;
      attribute?: { name: string; slug: string };
    };
  }>;
}

export interface StagedImageItem {
  id: string;
  file?: File;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  variantIds: string[];
}

export interface ImageUploaderProps {
  productId?: string;
  variants?: VariantItem[];
  // Staged mode props (used when creating a product before saving to DB)
  stagedImages?: StagedImageItem[];
  onStagedImagesChange?: (images: StagedImageItem[]) => void;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: "compressing" | "uploading" | "registering" | "done" | "error";
  errorMessage?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  productId,
  variants = [],
  stagedImages,
  onStagedImagesChange,
  disabled = false,
}) => {
  const isStagedMode = !productId || !!onStagedImagesChange;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState<{ id: string; value: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Variant selector modal state
  const [variantModalImage, setVariantModalImage] = useState<ProductImage | StagedImageItem | null>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [variantSearch, setVariantSearch] = useState("");

  // Lightbox modal state
  const [previewImage, setPreviewImage] = useState<{ url: string; alt?: string; name?: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Filter state (for filtering gallery by variant or primary)
  const [filterVariantId, setFilterVariantId] = useState<string>("ALL");

  // React Query hooks (for live productId mode)
  const { data: remoteImages = [], isLoading: isRemoteLoading } = useProductImages(
    !isStagedMode ? productId : undefined
  );
  const presignMutation = usePresignUpload();
  const addImageMutation = useAddProductImage(productId || "");
  const updateImageMutation = useUpdateProductImage(productId || "");
  const deleteImageMutation = useDeleteProductImage(productId || "");
  const reorderMutation = useReorderProductImages(productId || "");

  // Normalize images list (staged or remote)
  const images: Array<ProductImage | StagedImageItem> = useMemo(() => {
    if (isStagedMode) {
      return stagedImages || [];
    }
    return remoteImages.map((img) => ({
      ...img,
      variantIds: img.variantImages?.map((vi) => vi.variantId) || img.variantIds || [],
    }));
  }, [isStagedMode, stagedImages, remoteImages]);

  // Helper to extract display name / label for a variant
  const getVariantLabel = useCallback((v: VariantItem) => {
    if (v.variantName) return v.variantName;
    if (v.variantAttributeValues && v.variantAttributeValues.length > 0) {
      return v.variantAttributeValues.map((vav) => vav.attributeValue?.value).filter(Boolean).join(" / ");
    }
    if (v.attributes && v.attributes.length > 0) {
      return v.attributes.map((a) => a.value).join(" / ");
    }
    return v.sku || "Variant";
  }, []);

  // Helper to extract colorHex for a variant
  const getVariantColor = useCallback((v: VariantItem) => {
    if (v.variantAttributeValues && v.variantAttributeValues.length > 0) {
      const col = v.variantAttributeValues.find((vav) => vav.attributeValue?.colorHex);
      if (col?.attributeValue?.colorHex) return col.attributeValue.colorHex;
    }
    if (v.attributes && v.attributes.length > 0) {
      const col = v.attributes.find((a) => a.colorHex);
      if (col?.colorHex) return col.colorHex;
    }
    return null;
  }, []);

  // Filtered images based on current filter selection
  const filteredImages = useMemo(() => {
    if (filterVariantId === "ALL") return images;
    if (filterVariantId === "PRIMARY") return images.filter((img) => img.isPrimary);
    if (filterVariantId === "UNASSIGNED") {
      return images.filter((img) => {
        const vIds = "variantIds" in img ? img.variantIds : img.variantImages?.map((vi) => vi.variantId) || [];
        return !vIds || vIds.length === 0;
      });
    }
    return images.filter((img) => {
      const vIds = "variantIds" in img ? img.variantIds : img.variantImages?.map((vi) => vi.variantId) || [];
      return vIds?.includes(filterVariantId);
    });
  }, [images, filterVariantId]);

  // ── Upload Handlers ─────────────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const preview = URL.createObjectURL(file);

      setUploading((prev) => [
        ...prev,
        { id: tempId, file, preview, progress: "compressing" },
      ]);

      try {
        // 0. Compress: WebP, max 2048px, 0.85
        const compressed = await compressImage(file);

        if (isStagedMode) {
          // In staged mode, if productId exists (pre-generated UUID), we can presign and upload immediately to Supabase
          if (productId) {
            setUploading((prev) =>
              prev.map((u) => (u.id === tempId ? { ...u, progress: "uploading" } : u))
            );
            const { uploadUrl, publicUrl } = await presignMutation.mutateAsync({
              productId,
              fileName: compressed.name,
              mimeType: compressed.type,
            });

            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              body: compressed,
              headers: { "Content-Type": compressed.type },
            });
            if (!uploadRes.ok) throw new Error("Storage upload failed");

            const isFirst = (stagedImages?.length || 0) === 0;
            const newStagedItem: StagedImageItem = {
              id: tempId,
              file: compressed,
              imageUrl: publicUrl,
              altText: file.name.replace(/\.[^.]+$/, ""),
              isPrimary: isFirst,
              sortOrder: stagedImages?.length || 0,
              variantIds: [],
            };

            onStagedImagesChange?.([...(stagedImages || []), newStagedItem]);
          } else {
            // Local staged mode with object URL
            const isFirst = (stagedImages?.length || 0) === 0;
            const newStagedItem: StagedImageItem = {
              id: tempId,
              file: compressed,
              imageUrl: preview,
              altText: file.name.replace(/\.[^.]+$/, ""),
              isPrimary: isFirst,
              sortOrder: stagedImages?.length || 0,
              variantIds: [],
            };
            onStagedImagesChange?.([...(stagedImages || []), newStagedItem]);
          }

          setUploading((prev) =>
            prev.map((u) => (u.id === tempId ? { ...u, progress: "done" } : u))
          );
          setTimeout(() => {
            setUploading((prev) => prev.filter((u) => u.id !== tempId));
          }, 1200);
          return;
        }

        // Live mode with existing product in DB
        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: "uploading" } : u))
        );

        const { uploadUrl, publicUrl } = await presignMutation.mutateAsync({
          productId: productId!,
          fileName: compressed.name,
          mimeType: compressed.type,
        });

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: compressed,
          headers: { "Content-Type": compressed.type },
        });

        if (!uploadRes.ok) {
          throw new Error(`Storage upload failed: ${uploadRes.statusText}`);
        }

        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: "registering" } : u))
        );

        const isFirst = images.length === 0;
        await addImageMutation.mutateAsync({
          imageUrl: publicUrl,
          altText: file.name.replace(/\.[^.]+$/, ""),
          isPrimary: isFirst,
          sortOrder: images.length,
          variantIds: filterVariantId !== "ALL" && filterVariantId !== "PRIMARY" && filterVariantId !== "UNASSIGNED"
            ? [filterVariantId]
            : [],
        });

        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: "done" } : u))
        );

        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.id !== tempId));
          URL.revokeObjectURL(preview);
        }, 1200);
      } catch (err: any) {
        setUploading((prev) =>
          prev.map((u) =>
            u.id === tempId
              ? { ...u, progress: "error", errorMessage: err?.message || "Upload failed" }
              : u
          )
        );
      }
    },
    [isStagedMode, productId, stagedImages, onStagedImagesChange, presignMutation, images.length, addImageMutation, filterVariantId]
  );

  const handleFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 10 * 1024 * 1024) return false;
      return true;
    });
    valid.forEach(uploadFile);
  };

  // ── Drag & Drop Handlers ───────────────────────────────────────────────────

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDraggingOver(true);
  };

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData("imageId", imageId);
  };

  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("imageId");
    if (!draggedId || draggedId === targetId) {
      setDragOverId(null);
      return;
    }

    if (isStagedMode && stagedImages && onStagedImagesChange) {
      const currentOrder = [...stagedImages];
      const fromIdx = currentOrder.findIndex((img) => img.id === draggedId);
      const toIdx = currentOrder.findIndex((img) => img.id === targetId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const item = currentOrder.splice(fromIdx, 1)[0];
        currentOrder.splice(toIdx, 0, item);
        const updated = currentOrder.map((img, idx) => ({ ...img, sortOrder: idx }));
        onStagedImagesChange(updated);
      }
    } else {
      const currentOrder = images.map((img) => img.id);
      const fromIdx = currentOrder.indexOf(draggedId);
      const toIdx = currentOrder.indexOf(targetId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const newOrder = [...currentOrder];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggedId);
        reorderMutation.mutate(newOrder);
      }
    }
    setDragOverId(null);
  };

  // ── Actions (Set Primary, Alt text, Delete) ──────────────────────────────────

  const setPrimary = (imageId: string) => {
    if (isStagedMode && stagedImages && onStagedImagesChange) {
      const updated = stagedImages.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }));
      onStagedImagesChange(updated);
    } else {
      updateImageMutation.mutate({ imageId, data: { isPrimary: true } });
    }
  };

  const saveAltText = (imageId: string) => {
    if (!editingAlt) return;
    if (isStagedMode && stagedImages && onStagedImagesChange) {
      const updated = stagedImages.map((img) =>
        img.id === imageId ? { ...img, altText: editingAlt.value } : img
      );
      onStagedImagesChange(updated);
    } else {
      updateImageMutation.mutate({ imageId, data: { altText: editingAlt.value } });
    }
    setEditingAlt(null);
  };

  const confirmDelete = (imageId: string) => {
    if (isStagedMode && stagedImages && onStagedImagesChange) {
      const updated = stagedImages.filter((img) => img.id !== imageId);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      onStagedImagesChange(updated);
    } else {
      deleteImageMutation.mutate(imageId);
    }
    setDeleteConfirm(null);
  };

  // ── Variant Association Modal Handlers ─────────────────────────────────────

  const openVariantModal = (img: ProductImage | StagedImageItem) => {
    const vIds = "variantIds" in img ? img.variantIds : img.variantImages?.map((vi) => vi.variantId) || [];
    setSelectedVariantIds(vIds || []);
    setVariantModalImage(img);
    setVariantSearch("");
  };

  const toggleVariantSelection = (variantId: string) => {
    setSelectedVariantIds((prev) =>
      prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]
    );
  };

  const handleSelectAllVariants = () => {
    if (selectedVariantIds.length === variants.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(variants.map((v) => v.id));
    }
  };

  const saveVariantAssociations = () => {
    if (!variantModalImage) return;
    const imageId = variantModalImage.id;

    if (isStagedMode && stagedImages && onStagedImagesChange) {
      const updated = stagedImages.map((img) =>
        img.id === imageId ? { ...img, variantIds: selectedVariantIds } : img
      );
      onStagedImagesChange(updated);
    } else {
      updateImageMutation.mutate({
        imageId,
        data: { variantIds: selectedVariantIds },
      });
    }
    setVariantModalImage(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── Filter Bar (All / Primary / Unassigned / Per Variant) ─── */}
      {variants.length > 0 && images.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterVariantId("ALL")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${
              filterVariantId === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Layers className="h-3 w-3" />
            All Images ({images.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterVariantId("PRIMARY")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${
              filterVariantId === "PRIMARY"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Star className="h-3 w-3" fill={filterVariantId === "PRIMARY" ? "currentColor" : "none"} />
            Primary
          </button>

          <button
            type="button"
            onClick={() => setFilterVariantId("UNASSIGNED")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${
              filterVariantId === "UNASSIGNED"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            General / Unassigned
          </button>

          {variants.map((v) => {
            const label = getVariantLabel(v);
            const colorHex = getVariantColor(v);
            const count = images.filter((img) => {
              const vIds = "variantIds" in img ? img.variantIds : img.variantImages?.map((vi) => vi.variantId) || [];
              return vIds?.includes(v.id);
            }).length;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setFilterVariantId(v.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${
                  filterVariantId === v.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {colorHex && (
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                <span>{label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      filterVariantId === v.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Dropzone ────────────────────────────────────────────── */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setIsDraggingOver(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-9 px-6 select-none ${
          isDraggingOver
            ? "border-slate-800 bg-slate-100/70 scale-[1.008] shadow-sm"
            : "border-slate-200/90 hover:border-slate-400 hover:bg-slate-50/70 bg-slate-50/30"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200/80 text-slate-700">
          <ImagePlus className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">
            Drag & drop product images here, or{" "}
            <span className="text-slate-950 font-bold underline underline-offset-2">browse files</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Auto-converted to optimized WebP • High Quality (2048px) • JPEG, PNG, WebP, AVIF up to 10 MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          disabled={disabled}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* ── Upload Progress Queue ────────────────────────────────── */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs animate-in fade-in-0 duration-200"
            >
              <img
                src={u.preview}
                alt=""
                className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{u.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-medium text-slate-500">
                    {u.progress === "compressing" && "Optimizing to WebP…"}
                    {u.progress === "uploading" && "Uploading to storage…"}
                    {u.progress === "registering" && "Saving in catalog…"}
                    {u.progress === "done" && "Upload complete"}
                    {u.progress === "error" && (u.errorMessage || "Upload failed")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    • {(u.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                {u.progress === "compressing" || u.progress === "uploading" || u.progress === "registering" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : u.progress === "done" ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                )}
                {u.progress === "error" && (
                  <button
                    type="button"
                    onClick={() => setUploading((prev) => prev.filter((x) => x.id !== u.id))}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Image Gallery Grid ───────────────────────────────────── */}
      {!isStagedMode && isRemoteLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      )}

      {filteredImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredImages.map((image) => {
            const vIds =
              "variantIds" in image ? image.variantIds : image.variantImages?.map((vi) => vi.variantId) || [];
            const linkedVariants = variants.filter((v) => vIds?.includes(v.id));

            return (
              <ImageCard
                key={image.id}
                image={image}
                linkedVariants={linkedVariants}
                variants={variants}
                isEditingAlt={editingAlt?.id === image.id}
                altEditValue={editingAlt?.id === image.id ? editingAlt.value : image.altText || ""}
                isDragOver={dragOverId === image.id}
                isDeleteConfirm={deleteConfirm === image.id}
                isUpdating={!isStagedMode && updateImageMutation.isPending}
                isDeleting={!isStagedMode && deleteImageMutation.isPending}
                getVariantLabel={getVariantLabel}
                getVariantColor={getVariantColor}
                onDragStart={handleDragStart}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(image.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => handleCardDrop(e, image.id)}
                onSetPrimary={() => setPrimary(image.id)}
                onStartAltEdit={() =>
                  setEditingAlt({ id: image.id, value: image.altText || "" })
                }
                onAltChange={(val) => setEditingAlt({ id: image.id, value: val })}
                onSaveAlt={() => saveAltText(image.id)}
                onCancelAlt={() => setEditingAlt(null)}
                onDeleteRequest={() => setDeleteConfirm(image.id)}
                onDeleteConfirm={() => confirmDelete(image.id)}
                onDeleteCancel={() => setDeleteConfirm(null)}
                onOpenVariants={() => openVariantModal(image)}
                onPreview={() =>
                  setPreviewImage({
                    url: image.imageUrl,
                    alt: image.altText || undefined,
                  })
                }
              />
            );
          })}
        </div>
      )}

      {filteredImages.length === 0 && images.length > 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-600">No images matched the selected filter.</p>
          <button
            type="button"
            onClick={() => setFilterVariantId("ALL")}
            className="mt-2 text-xs font-bold text-slate-900 underline underline-offset-2 cursor-pointer"
          >
            Show all images
          </button>
        </div>
      )}

      {images.length === 0 && uploading.length === 0 && !isRemoteLoading && (
        <p className="text-center text-xs text-slate-400 py-3">
          No images uploaded yet. Drag & drop or browse photos above to get started.
        </p>
      )}

      {/* ── Variant Linker Modal ─────────────────────────────────── */}
      {variantModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0">
          <div className="fixed inset-0" onClick={() => setVariantModalImage(null)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                  <Tags className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Link Variants</h3>
                  <p className="text-[11px] text-slate-500">Associate this image with specific product variants</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVariantModalImage(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="flex items-center gap-3 my-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={variantModalImage.imageUrl}
                alt=""
                className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {variantModalImage.altText || "Product Image"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedVariantIds.length === 0
                    ? "Available across all variants (general product image)"
                    : `Linked to ${selectedVariantIds.length} variant${selectedVariantIds.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Search & Actions */}
            {variants.length > 3 && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={variantSearch}
                  onChange={(e) => setVariantSearch(e.target.value)}
                  placeholder="Filter variants..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between py-1 mb-2 text-[11px] text-slate-500">
              <span>{variants.length} total variants</span>
              <button
                type="button"
                onClick={handleSelectAllVariants}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                {selectedVariantIds.length === variants.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Variant List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 sidebar-scrollbar">
              {variants
                .filter((v) => {
                  const label = getVariantLabel(v).toLowerCase();
                  const sku = (v.sku || "").toLowerCase();
                  return label.includes(variantSearch.toLowerCase()) || sku.includes(variantSearch.toLowerCase());
                })
                .map((v) => {
                  const isChecked = selectedVariantIds.includes(v.id);
                  const label = getVariantLabel(v);
                  const colorHex = getVariantColor(v);

                  return (
                    <label
                      key={v.id}
                      onClick={() => toggleVariantSelection(v.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition select-none ${
                        isChecked
                          ? "border-slate-800 bg-slate-50/80 shadow-2xs"
                          : "border-slate-200/80 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-md border text-white transition ${
                            isChecked ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        {colorHex && (
                          <span
                            className="h-3 w-3 rounded-full border border-slate-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                        )}
                        <span className="text-xs font-semibold text-slate-800 truncate">{label}</span>
                      </div>
                      {v.sku && <span className="text-[10px] font-mono text-slate-400 shrink-0">{v.sku}</span>}
                    </label>
                  );
                })}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVariantModalImage(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveVariantAssociations}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition cursor-pointer active:scale-[0.98]"
              >
                Save Associations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Lightbox Modal ────────────────────────────── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in-0">
          <div className="fixed inset-0" onClick={() => setPreviewImage(null)} />
          <div className="relative z-10 flex flex-col items-center max-w-4xl max-h-[90vh] rounded-3xl bg-white overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex w-full items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {previewImage.alt || "Product Image Preview"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(previewImage.url)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  {copiedUrl ? "Copied URL!" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-950/5 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.alt || "Product preview"}
                className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Image Card Sub-Component ──────────────────────────────────────────────────

interface ImageCardProps {
  image: ProductImage | StagedImageItem;
  linkedVariants: VariantItem[];
  variants: VariantItem[];
  isEditingAlt: boolean;
  altEditValue: string;
  isDragOver: boolean;
  isDeleteConfirm: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  getVariantLabel: (v: VariantItem) => string;
  getVariantColor: (v: VariantItem) => string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onSetPrimary: () => void;
  onStartAltEdit: () => void;
  onAltChange: (val: string) => void;
  onSaveAlt: () => void;
  onCancelAlt: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onOpenVariants: () => void;
  onPreview: () => void;
}

function ImageCard({
  image,
  linkedVariants,
  variants,
  isEditingAlt,
  altEditValue,
  isDragOver,
  isDeleteConfirm,
  isUpdating,
  isDeleting,
  getVariantLabel,
  getVariantColor,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSetPrimary,
  onStartAltEdit,
  onAltChange,
  onSaveAlt,
  onCancelAlt,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  onOpenVariants,
  onPreview,
}: ImageCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, image.id)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative rounded-2xl border overflow-hidden bg-white shadow-2xs transition-all duration-200 ${
        isDragOver
          ? "border-slate-800 ring-2 ring-slate-800/30 scale-[1.02] shadow-md"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
        <img
          src={image.imageUrl}
          alt={image.altText || "Product photo"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Zoom Overlay Button */}
        <button
          type="button"
          onClick={onPreview}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
          title="Click to view full preview"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-xs text-white shadow">
            <Maximize2 className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Primary Badge */}
      {image.isPrimary && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-md backdrop-blur-xs">
            <Star className="h-2.5 w-2.5" fill="currentColor" />
            Primary
          </span>
        </div>
      )}

      {/* Drag Handle */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <div className="rounded-lg bg-white/90 p-1 shadow-md backdrop-blur-xs text-slate-600 hover:text-slate-900">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Linked Variants Pill Indicator */}
      {linkedVariants.length > 0 && (
        <div className="absolute bottom-11 left-2 right-2 z-10 flex flex-wrap gap-1 pointer-events-none">
          {linkedVariants.slice(0, 2).map((v) => {
            const label = getVariantLabel(v);
            const colorHex = getVariantColor(v);
            return (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-slate-800 shadow-xs backdrop-blur-xs truncate max-w-[80px]"
              >
                {colorHex && (
                  <span
                    className="h-2 w-2 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                <span className="truncate">{label}</span>
              </span>
            );
          })}
          {linkedVariants.length > 2 && (
            <span className="inline-flex items-center rounded-md bg-white/90 px-1 py-0.5 text-[8px] font-bold text-slate-700 shadow-xs backdrop-blur-xs">
              +{linkedVariants.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Card Action Footer Bar */}
      <div className="p-2 bg-white border-t border-slate-100 flex flex-col gap-1.5">
        {!isEditingAlt && !isDeleteConfirm && (
          <div className="flex items-center gap-1">
            {!image.isPrimary && (
              <button
                type="button"
                onClick={onSetPrimary}
                disabled={isUpdating}
                title="Set as catalog primary image"
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 py-1 text-[10px] font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <Star className="h-3 w-3" />
                Primary
              </button>
            )}

            {variants.length > 0 && (
              <button
                type="button"
                onClick={onOpenVariants}
                title="Link with variants"
                className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-bold transition cursor-pointer ${
                  linkedVariants.length > 0
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-2xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Tags className="h-3 w-3" />
                {linkedVariants.length > 0 ? `${linkedVariants.length} Vars` : "Variants"}
              </button>
            )}

            <button
              type="button"
              onClick={onStartAltEdit}
              title="Edit image alt text"
              className="flex items-center justify-center rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Alt
            </button>

            <button
              type="button"
              onClick={onDeleteRequest}
              title="Delete image"
              className="flex items-center justify-center rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Alt Text Inline Editor */}
        {isEditingAlt && (
          <div className="flex flex-col gap-1.5 animate-in fade-in-0 duration-150">
            <input
              autoFocus
              type="text"
              value={altEditValue}
              onChange={(e) => onAltChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveAlt();
                if (e.key === "Escape") onCancelAlt();
              }}
              placeholder="Enter descriptive alt text…"
              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-900 focus:border-slate-500 focus:outline-none"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onSaveAlt}
                disabled={isUpdating}
                className="flex-1 rounded-lg bg-slate-900 py-1 text-[10px] font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelAlt}
                className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {isDeleteConfirm && (
          <div className="flex flex-col gap-1 animate-in fade-in-0 duration-150">
            <p className="text-[10px] font-bold text-rose-700 text-center">Delete this image?</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-rose-600 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                {isDeleting ? "…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={onDeleteCancel}
                className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;

