"use client";

import React, { useCallback, useRef, useState } from "react";
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
// No external library — uses browser Canvas API.
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
        // Keep original name but signal webp type
        const baseName = file.name.replace(/\.[^.]+$/, "");
        resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
      },
      "image/webp",
      quality
    );
  });
}

interface UploadingFile {
  id: string; // temp local id
  file: File;
  preview: string;
  progress: "uploading" | "registering" | "done" | "error";
  errorMessage?: string;
}

interface ImageUploaderProps {
  productId: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ productId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState<{ id: string; value: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const { data: images = [], isLoading } = useProductImages(productId);
  const presignMutation = usePresignUpload();
  const addImageMutation = useAddProductImage(productId);
  const updateImageMutation = useUpdateProductImage(productId);
  const deleteImageMutation = useDeleteProductImage(productId);
  const reorderMutation = useReorderProductImages(productId);

  // ── File upload pipeline ────────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      const tempId = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      setUploading((prev) => [
        ...prev,
        { id: tempId, file, preview, progress: "uploading" },
      ]);

      try {
        // 0. Compress: convert to WebP, cap at 2048px, 0.85 quality
        const compressed = await compressImage(file);

        // 1. Get presigned upload URL from backend
        const { uploadUrl, publicUrl } = await presignMutation.mutateAsync({
          productId,
          fileName: compressed.name,
          mimeType: compressed.type,
        });

        // 2. PUT compressed file directly to Supabase Storage
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

        // 3. Register the public URL in the database
        const isFirst = images.length === 0;
        await addImageMutation.mutateAsync({
          imageUrl: publicUrl,
          isPrimary: isFirst,
        });

        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: "done" } : u))
        );

        // Remove done item after brief delay
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
    [productId, images.length, presignMutation, addImageMutation]
  );

  const handleFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });
    valid.forEach(uploadFile);
  };

  // ── Drop zone events ────────────────────────────────────────────────────────

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  // ── Drag-to-reorder handlers ────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData("imageId", imageId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("imageId");
    if (!draggedId || draggedId === targetId) {
      setDragOverId(null);
      return;
    }
    const currentOrder = images.map((img) => img.id);
    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetId);
    const newOrder = [...currentOrder];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedId);
    reorderMutation.mutate(newOrder);
    setDragOverId(null);
  };

  // ── Alt text editing ────────────────────────────────────────────────────────

  const saveAltText = (imageId: string) => {
    if (!editingAlt) return;
    updateImageMutation.mutate({ imageId, data: { altText: editingAlt.value } });
    setEditingAlt(null);
  };

  // ── Set primary ─────────────────────────────────────────────────────────────

  const setPrimary = (imageId: string) => {
    updateImageMutation.mutate({ imageId, data: { isPrimary: true } });
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const confirmDelete = (imageId: string) => {
    deleteImageMutation.mutate(imageId);
    setDeleteConfirm(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setIsDraggingOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 select-none
          ${isDraggingOver
            ? "border-slate-500 bg-slate-50 scale-[1.01]"
            : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/60"
          }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <ImagePlus className="h-6 w-6 text-slate-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            Drop images here or <span className="text-slate-900 underline underline-offset-2">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WebP, AVIF — max 5 MB each</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress queue */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs"
            >
              {/* Preview thumbnail */}
              <img
                src={u.preview}
                alt=""
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{u.file.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {u.progress === "uploading" && "Uploading to storage…"}
                  {u.progress === "registering" && "Saving image…"}
                  {u.progress === "done" && "Done!"}
                  {u.progress === "error" && (u.errorMessage || "Upload failed")}
                </p>
              </div>
              <div className="flex-shrink-0">
                {u.progress === "uploading" || u.progress === "registering" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : u.progress === "done" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                )}
              </div>
              {u.progress === "error" && (
                <button
                  onClick={() => setUploading((prev) => prev.filter((x) => x.id !== u.id))}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing images grid */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isEditingAlt={editingAlt?.id === image.id}
              altEditValue={editingAlt?.id === image.id ? editingAlt.value : image.altText || ""}
              isDragOver={dragOverId === image.id}
              isDeleteConfirm={deleteConfirm === image.id}
              isUpdating={updateImageMutation.isPending}
              isDeleting={deleteImageMutation.isPending}
              onDragStart={handleDragStart}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverId(image.id);
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => handleDrop(e, image.id)}
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
            />
          ))}
        </div>
      )}

      {!isLoading && images.length === 0 && uploading.length === 0 && (
        <p className="text-center text-xs text-slate-400 py-2">No images yet — upload your first image above.</p>
      )}
    </div>
  );
};

// ── Image card sub-component ──────────────────────────────────────────────────

interface ImageCardProps {
  image: ProductImage;
  isEditingAlt: boolean;
  altEditValue: string;
  isDragOver: boolean;
  isDeleteConfirm: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
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
}

function ImageCard({
  image,
  isEditingAlt,
  altEditValue,
  isDragOver,
  isDeleteConfirm,
  isUpdating,
  isDeleting,
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
}: ImageCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, image.id)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative rounded-xl border overflow-hidden bg-white transition-all duration-150 ${
        isDragOver
          ? "border-slate-600 ring-2 ring-slate-400/40 scale-[1.02]"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Image */}
      <div className="aspect-square bg-slate-50">
        <img
          src={image.imageUrl}
          alt={image.altText || "Product image"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Primary badge */}
      {image.isPrimary && (
        <div className="absolute top-1.5 left-1.5">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
            <Star className="h-2.5 w-2.5" fill="currentColor" />
            Primary
          </span>
        </div>
      )}

      {/* Drag handle */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <div className="rounded-md bg-white/90 p-1 shadow">
          <GripVertical className="h-3 w-3 text-slate-500" />
        </div>
      </div>

      {/* Action overlay */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-white border-t border-slate-100 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditingAlt && !isDeleteConfirm && (
          <div className="flex gap-1">
            {!image.isPrimary && (
              <button
                onClick={onSetPrimary}
                disabled={isUpdating}
                title="Set as primary"
                className="flex-1 flex items-center justify-center gap-0.5 rounded-lg bg-slate-900 py-1 text-[10px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
              >
                <Star className="h-2.5 w-2.5" />
                Primary
              </button>
            )}
            <button
              onClick={onStartAltEdit}
              title="Edit alt text"
              className="flex-1 flex items-center justify-center rounded-lg border border-slate-200 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Alt
            </button>
            <button
              onClick={onDeleteRequest}
              title="Delete image"
              className="flex items-center justify-center rounded-lg border border-rose-100 bg-rose-50 px-1.5 py-1 text-rose-600 hover:bg-rose-100 transition"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Alt text editor */}
        {isEditingAlt && (
          <div className="flex flex-col gap-1">
            <input
              autoFocus
              type="text"
              value={altEditValue}
              onChange={(e) => onAltChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveAlt();
                if (e.key === "Escape") onCancelAlt();
              }}
              placeholder="Alt text…"
              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-900 focus:border-slate-500 focus:outline-none"
            />
            <div className="flex gap-1">
              <button
                onClick={onSaveAlt}
                disabled={isUpdating}
                className="flex-1 rounded-lg bg-slate-900 py-1 text-[10px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
              >
                Save
              </button>
              <button
                onClick={onCancelAlt}
                className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {isDeleteConfirm && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-rose-700 text-center">Delete image?</p>
            <div className="flex gap-1">
              <button
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-rose-600 py-1 text-[10px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {isDeleting ? "…" : "Yes, delete"}
              </button>
              <button
                onClick={onDeleteCancel}
                className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sort order label */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-end px-1.5 pb-0.5 pointer-events-none opacity-0 group-hover:opacity-0">
      </div>
    </div>
  );
}

export default ImageUploader;
