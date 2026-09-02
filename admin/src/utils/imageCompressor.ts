import imageCompression from "browser-image-compression";

export interface ImageCompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  fileType?: string;
  useWebWorker?: boolean;
  onProgress?: (progressPercentage: number) => void;
}

export interface CompressedImageResult {
  file: File;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
  dataUrl?: string;
}

export const MAX_IMAGE_FILE_SIZE_MB = 2;
export const MAX_IMAGE_FILE_SIZE_BYTES = MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validates file type and enforces the strict 2MB maximum upload size limit.
 */
export function validateImageFile(file: File, maxMb = MAX_IMAGE_FILE_SIZE_MB): { valid: boolean; error?: string } {
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: `"${file.name}" is not a supported image file.` };
  }
  if (file.size > maxMb * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `"${file.name}" (${sizeMb}MB) exceeds the maximum allowed upload size of ${maxMb}MB. Please select an image under ${maxMb}MB.`,
    };
  }
  return { valid: true };
}

const DEFAULT_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 0.12, // Targets ~100KB - 120KB output for optimal loading speed and low storage
  maxWidthOrHeight: 1800, // 1800px resolution maintains ultra-sharp clarity on Retina & 4K displays
  quality: 0.82, // Visually lossless WebP quality ratio with high color and edge fidelity
  fileType: "image/webp", // Modern high-efficiency WebP format
  useWebWorker: true, // Non-blocking background worker thread
};

/**
 * Core image compressor: Compresses any image file client-side before uploading.
 * Enforces strict 2MB max size constraint.
 */
export async function compressImage(
  file: File,
  options?: ImageCompressionOptions
): Promise<File> {
  // Validate file size limit
  const validation = validateImageFile(file, MAX_IMAGE_FILE_SIZE_MB);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Skip non-images or SVGs
  if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
    return file;
  }

  const opts = {
    maxSizeMB: options?.maxSizeMB ?? DEFAULT_OPTIONS.maxSizeMB,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? DEFAULT_OPTIONS.maxWidthOrHeight,
    initialQuality: options?.quality ?? DEFAULT_OPTIONS.quality,
    fileType: options?.fileType ?? DEFAULT_OPTIONS.fileType,
    useWebWorker: options?.useWebWorker ?? DEFAULT_OPTIONS.useWebWorker,
    onProgress: options?.onProgress,
  };

  try {
    const compressedBlob = await imageCompression(file, opts);
    
    // Ensure clean filename and correct webp extension
    const ext = opts.fileType === "image/webp" ? ".webp" : opts.fileType === "image/png" ? ".png" : ".jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const finalFileName = `${baseName}${ext}`;

    return new File([compressedBlob], finalFileName, {
      type: compressedBlob.type || opts.fileType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Worker-based image compression encountered an error, using original file:", error);
    return file;
  }
}

/**
 * Compresses an image and returns full before/after size statistics and metrics.
 */
export async function compressImageWithStats(
  file: File,
  options?: ImageCompressionOptions
): Promise<CompressedImageResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
    return {
      file,
      originalSizeKb,
      compressedSizeKb: originalSizeKb,
      reductionPercentage: 0,
    };
  }

  const compressedFile = await compressImage(file, options);
  const compressedSizeKb = Math.round(compressedFile.size / 1024);
  const reductionPercentage = originalSizeKb > 0
    ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
    : 0;

  return {
    file: compressedFile,
    originalSizeKb,
    compressedSizeKb,
    reductionPercentage,
  };
}

/**
 * Specialized high-resolution banner compression (up to 2560px for 4K desktop campaign posters)
 */
export async function compressBannerImage(
  file: File,
  maxWidthOrHeight = 2560,
  quality = 0.85
): Promise<CompressedImageResult & { dataUrl: string }> {
  const stats = await compressImageWithStats(file, {
    maxSizeMB: 0.35, // Targets ~250KB - 350KB for ultra-wide full-screen 4K banners
    maxWidthOrHeight,
    quality,
    fileType: "image/webp",
    useWebWorker: true,
  });

  const dataUrl = await fileToDataUrl(stats.file);

  return {
    ...stats,
    dataUrl,
  };
}

/**
 * Batch compress multiple image files concurrently
 */
export async function compressImageFiles(
  files: File[],
  options?: ImageCompressionOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Helper to convert File to Data URL (base64)
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
