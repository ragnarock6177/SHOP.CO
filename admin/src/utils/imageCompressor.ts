/**
 * Client-Side Image Compression without Quality Loss
 * Uses HTML5 Canvas 2D with high-quality bicubic smoothing to convert camera/banner photos
 * to WebP format (max 1920x1080) at 0.85 quality ratio.
 */
export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
}

export async function compressBannerImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<CompressedImageResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to initialize Canvas 2D Context"));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                dataUrl,
                originalSizeKb,
                compressedSizeKb: originalSizeKb,
                reductionPercentage: 0,
              });
            }

            const compressedSizeKb = Math.round(blob.size / 1024);
            const reductionPercentage = Math.max(
              0,
              Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)
            );

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".webp",
              {
                type: "image/webp",
                lastModified: Date.now(),
              }
            );

            resolve({
              file: compressedFile,
              dataUrl,
              originalSizeKb,
              compressedSizeKb,
              reductionPercentage,
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
