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

const DEFAULT_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 1.2, // Max 1.2MB target (ample for ultra high-res 2048px fashion product photos)
  maxWidthOrHeight: 2048, // 2048px maximum width/height (standard for Retina/4K displays)
  quality: 0.90, // Visually lossless quality ratio
  fileType: "image/webp", // Ultra-efficient modern WebP format
  useWebWorker: true, // Non-blocking background worker thread
};

/**
 * Core image compressor: Compresses any image file client-side before uploading.
 */
export async function compressImage(
  file: File,
  options?: ImageCompressionOptions
): Promise<File> {
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
  quality = 0.90
): Promise<CompressedImageResult & { dataUrl: string }> {
  const stats = await compressImageWithStats(file, {
    maxSizeMB: 2.0,
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
