import { compressImage, compressImageWithStats, CompressedImageResult, ImageCompressionOptions } from "@/utils/imageCompressor";
import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";
import { PresignResult } from "@/hooks/queries/useProductImages";

export interface UploadImageParams {
  file: File;
  productId: string;
  options?: ImageCompressionOptions;
  onProgress?: (stage: "compressing" | "uploading" | "registering" | "done") => void;
}

export interface UploadImageResult {
  publicUrl: string;
  storagePath: string;
  compressedFile: File;
  stats: CompressedImageResult;
}

/**
 * Global Unified Service for Compressing & Uploading Product Images to Cloud Storage
 */
export async function compressAndUploadImage({
  file,
  productId,
  options,
  onProgress,
}: UploadImageParams): Promise<UploadImageResult> {
  // 1. Stage: Compressing
  onProgress?.("compressing");
  const stats = await compressImageWithStats(file, options);
  const compressedFile = stats.file;

  // 2. Stage: Presign Upload URL
  onProgress?.("uploading");
  const presignRes = await apiClient.post<ApiResponse<PresignResult>>(
    "/admin/upload/presign",
    {
      productId,
      fileName: compressedFile.name,
      mimeType: compressedFile.type,
    }
  );

  const { uploadUrl, publicUrl, storagePath } = presignRes.data.data;

  // 3. Stage: Upload to Storage (Supabase/S3)
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: compressedFile,
    headers: {
      "Content-Type": compressedFile.type,
    },
  });

  if (!uploadRes.ok) {
    throw new Error(`Storage upload failed with status ${uploadRes.status}: ${uploadRes.statusText}`);
  }

  onProgress?.("done");

  return {
    publicUrl,
    storagePath,
    compressedFile,
    stats,
  };
}

/**
 * Batch upload multiple image files with auto-compression
 */
export async function compressAndUploadBatchImages(
  files: File[],
  productId: string,
  options?: ImageCompressionOptions,
  onItemProgress?: (index: number, stage: "compressing" | "uploading" | "done", stats?: CompressedImageResult) => void
): Promise<UploadImageResult[]> {
  const results: UploadImageResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const res = await compressAndUploadImage({
      file,
      productId,
      options,
      onProgress: (stage) => onItemProgress?.(i, stage === "registering" ? "uploading" : stage),
    });
    onItemProgress?.(i, "done", res.stats);
    results.push(res);
  }

  return results;
}
