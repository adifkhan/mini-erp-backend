import cloudinary from "../config/cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a buffer (from multer's memoryStorage — required since Vercel's serverless
 * filesystem is read-only/ephemeral, so we never write the file to disk at all).
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder = "mini-erp/products"
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteCloudinaryImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-fatal: log and continue, don't block the main operation
    console.error("Failed to delete Cloudinary image:", err);
  }
};
