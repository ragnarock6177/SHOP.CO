"use client";

import React, { useRef, useState, useMemo } from "react";
import { ImagePlus, Loader2, Trash2, Plus } from "lucide-react";
import { usePresignUpload, useAddProductImage, useDeleteProductImage, useProductImages } from "@/hooks/queries/useProductImages";
import { StagedImageItem } from "./ImageUploader";
import { compressImage, validateImageFile } from "@/utils/imageCompressor";
import { toast } from "@/lib/toast";

interface ColorGroupImageUploaderProps {
  productId?: string;
  colorLabel: string;
  variantIds: string[];
  stagedImages?: StagedImageItem[];
  onStagedImagesChange?: (images: StagedImageItem[]) => void;
  disabled?: boolean;
}

export const ColorGroupImageUploader: React.FC<ColorGroupImageUploaderProps> = ({
  productId,
  colorLabel,
  variantIds,
  stagedImages,
  onStagedImagesChange,
  disabled = false,
}) => {
  const isStagedMode = !productId || !!onStagedImagesChange;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Queries
  const { data: remoteImages = [] } = useProductImages(!isStagedMode ? productId : undefined);
  const presignMutation = usePresignUpload();
  const addImageMutation = useAddProductImage(productId || "");
  const deleteImageMutation = useDeleteProductImage(productId || "");

  // Find images belonging to this color
  const colorImages = useMemo(() => {
    if (isStagedMode) {
      return (stagedImages || []).filter((img) => 
        img.variantIds?.some((id) => variantIds.includes(id))
      ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return remoteImages.filter((img) => {
      const vIds = img.variantImages?.map((vi) => vi.variantId) || img.variantIds || [];
      return vIds.some((id) => variantIds.includes(id));
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [isStagedMode, stagedImages, remoteImages, variantIds]);

  const primaryImage = colorImages[0];
  const otherImages = colorImages.slice(1);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    // Filter and validate 2MB restriction
    const files: File[] = [];
    for (const f of rawFiles) {
      const validation = validateImageFile(f);
      if (!validation.valid) {
        toast.warning("Invalid image", validation.error);
        continue;
      }
      files.push(f);
    }

    if (!files.length) return;

    setIsUploading(true);
    setUploadPreview(URL.createObjectURL(files[0])); // Show first as preview

    try {
      const newStagedItems: StagedImageItem[] = [];
      let currentCount = isStagedMode ? (stagedImages?.length || 0) : remoteImages.length;

      for (const file of files) {
        const compressed = await compressImage(file);
        const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        if (isStagedMode) {
          if (productId) {
            // Pre-generated UUID mode
            const { uploadUrl, publicUrl } = await presignMutation.mutateAsync({
              productId,
              fileName: compressed.name,
              mimeType: compressed.type,
            });
            
            await fetch(uploadUrl, {
              method: "PUT",
              body: compressed,
              headers: { "Content-Type": compressed.type },
            });

            newStagedItems.push({
              id: tempId,
              file: compressed,
              imageUrl: publicUrl,
              altText: `${colorLabel} Image`,
              isPrimary: currentCount === 0,
              sortOrder: currentCount,
              variantIds: variantIds,
            });
          } else {
            // Local blob mode
            newStagedItems.push({
              id: tempId,
              file: compressed,
              imageUrl: URL.createObjectURL(compressed),
              altText: `${colorLabel} Image`,
              isPrimary: currentCount === 0,
              sortOrder: currentCount,
              variantIds: variantIds,
            });
          }
        } else {
          // Live DB mode
          const { uploadUrl, publicUrl } = await presignMutation.mutateAsync({
            productId: productId!,
            fileName: compressed.name,
            mimeType: compressed.type,
          });

          await fetch(uploadUrl, {
            method: "PUT",
            body: compressed,
            headers: { "Content-Type": compressed.type },
          });

          await addImageMutation.mutateAsync({
            imageUrl: publicUrl,
            altText: `${colorLabel} Image`,
            isPrimary: currentCount === 0,
            sortOrder: currentCount,
            variantIds: variantIds,
            silentSuccess: true,
          });
        }
        currentCount++;
      }

      if (!isStagedMode && files.length > 0) {
        toast.success(
          files.length === 1 ? "Image Uploaded" : "Images Uploaded",
          files.length === 1
            ? "Color image added successfully."
            : `${files.length} color images added successfully.`,
        );
      }

      if (isStagedMode && newStagedItems.length > 0) {
        onStagedImagesChange?.([...(stagedImages || []), ...newStagedItems]);
      }
    } catch (err) {
      toast.apiError(err, "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (imageId: string) => {
    if (isStagedMode) {
      onStagedImagesChange?.((stagedImages || []).filter((img) => img.id !== imageId));
    } else {
      deleteImageMutation.mutate(imageId);
    }
  };

  return (
    <div className="flex flex-col space-y-3 shrink-0 w-48">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Gallery</span>
      
      {/* Main Large Image */}
      <div 
        onClick={() => !disabled && !isUploading && !primaryImage && fileInputRef.current?.click()}
        className={`relative w-full aspect-4/5 rounded-md border-2 flex items-center justify-center overflow-hidden transition-all duration-200 group ${
          !primaryImage && !isUploading 
            ? "border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer hover:border-slate-400" 
            : "border-slate-200 bg-white"
        }`}
      >
        {isUploading && !primaryImage ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 text-slate-600 animate-spin mb-2" />
            <span className="text-[10px] font-bold text-slate-600">UPLOADING...</span>
          </div>
        ) : null}

        {primaryImage || uploadPreview ? (
          <>
            <img 
              src={uploadPreview && !primaryImage ? uploadPreview : primaryImage?.imageUrl} 
              alt={colorLabel} 
              className="w-full h-full object-cover"
            />
            {!isUploading && !disabled && primaryImage && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(primaryImage.id);
                  }}
                  className="bg-white/90 hover:bg-white text-rose-600 p-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
            <ImagePlus className="w-8 h-8 mb-2" />
            <span className="text-xs font-semibold">Upload Image</span>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {(primaryImage || isUploading) && (
        <div className="flex flex-wrap gap-2">
          {otherImages.map((img) => (
            <div key={img.id} className="relative w-10 h-12 rounded-md border border-slate-200 overflow-hidden group">
              <img src={img.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {isUploading && primaryImage && (
            <div className="w-10 h-12 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-12 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleUpload}
      />
    </div>
  );
};
