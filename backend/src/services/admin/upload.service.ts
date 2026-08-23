import fs from "fs";
import path from "path";
import { supabaseAdmin, STORAGE_BUCKET } from "../../lib/supabase.js";
import { ValidationError } from "../../utils/errors.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export class UploadService {
  /**
   * Generate a short-lived signed upload URL so the browser can
   * PUT the file directly to Supabase Storage.
   */
  static async presignProductImage(
    productId: string,
    fileName: string,
    mimeType: string
  ): Promise<{ uploadUrl: string; publicUrl: string; storagePath: string }> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(
        `Unsupported file type: ${mimeType}. Allowed: jpeg, png, webp, avif.`
      );
    }

    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `products/${productId}/${uniqueName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      throw new Error(`Failed to generate upload URL: ${error?.message}`);
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return {
      uploadUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
      storagePath,
    };
  }

  /**
   * Upload banner image (compressed base64 string) with automatic Supabase & Local Fallback.
   */
  static async uploadBannerImage(
    base64Data: string,
    fileName: string
  ): Promise<{ publicUrl: string; storagePath: string }> {
    const matches = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = "image/webp";

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const ext = fileName.split(".").pop()?.toLowerCase() || "webp";
    const uniqueName = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `banners/${uniqueName}`;

    // Try Supabase Storage first
    try {
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error) {
        const { data: publicData } = supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        return {
          publicUrl: publicData.publicUrl,
          storagePath,
        };
      }
    } catch (supabaseErr) {
      console.warn("[UploadService] Supabase upload failed, fallback to local storage:", supabaseErr);
    }

    // Fallback: Local Storage Directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `http://localhost:5000/uploads/banners/${uniqueName}`;
    return {
      publicUrl,
      storagePath: `local:${uniqueName}`,
    };
  }

  /**
   * Delete a file from Supabase Storage by its storage path.
   */
  static async deleteFile(storagePath: string): Promise<void> {
    if (storagePath.startsWith("local:")) {
      const fileName = storagePath.replace("local:", "");
      const filePath = path.join(process.cwd(), "public", "uploads", "banners", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return;
    }

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.warn(`[UploadService] Failed to delete file ${storagePath}:`, error.message);
    }
  }
}
