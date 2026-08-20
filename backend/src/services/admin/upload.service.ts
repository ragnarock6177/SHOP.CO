import { supabaseAdmin, STORAGE_BUCKET } from "../../lib/supabase.js";
import { ValidationError } from "../../utils/errors.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_MB = 5;

export class UploadService {
  /**
   * Generate a short-lived signed upload URL so the browser can
   * PUT the file directly to Supabase Storage (no file data goes through Express).
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

    // Sanitise the filename and build a unique path
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `products/${productId}/${uniqueName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      throw new Error(`Failed to generate upload URL: ${error?.message}`);
    }

    // Build the public URL for storing in the DB after upload
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
   * Delete a file from Supabase Storage by its storage path.
   */
  static async deleteFile(storagePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    // Non-fatal: log but don't throw — the DB record is the source of truth
    if (error) {
      console.warn(`[UploadService] Failed to delete file ${storagePath}:`, error.message);
    }
  }
}
